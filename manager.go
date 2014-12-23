package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"sync"

	"github.com/Sirupsen/logrus"
	"github.com/jinzhu/gorm"
	"gopkg.in/igm/sockjs-go.v2/sockjs"
)

// The manager for all note updates
type NoteManager struct {
	// Serialize all modifications through these
	commands chan interface{}
	errors   chan error

	// Clients
	clients     []sockjs.Session
	clientsLock sync.RWMutex

	// Internal components
	db      gorm.DB
	handler http.Handler

	// Signalled when the run loop is done
	done chan struct{}
}

func NewNoteManager(dbType, dbConn string) (*NoteManager, error) {
	var err error

	log.WithFields(logrus.Fields{
		"dbtype": dbType,
		"dbconn": dbConn,
	}).Debug("Opening database")

	db, err := gorm.Open(flagDbType, flagDbConn)
	if err != nil {
		log.WithField("error", err).Error("Could not open database")
		return nil, err
	}

	// Create tables, add columns.  Note that this will not delete columns.
	db.AutoMigrate(&Note{})

	// Create the final NoteManager.
	ret := &NoteManager{
		commands: make(chan interface{}),
		errors:   make(chan error),
		db:       db,
		done:     make(chan struct{}),
	}
	ret.handler = sockjs.NewHandler("/api/sockjs", sockjs.DefaultOptions, ret.onMessage)

	// If we get here, everything's good - start the run loop and return okay.
	go ret.run()
	return ret, nil
}

func (mgr *NoteManager) Close() error {
	// Ensure the run loop is stopped before we close resources
	close(mgr.commands)
	<-mgr.done

	// Shut down all clients
	mgr.clientsLock.Lock()
	for _, client := range mgr.clients {
		// TODO: proper reason?
		client.Close(204, "shutting down")
	}
	mgr.clients = nil
	mgr.clientsLock.Unlock()

	// Close the DB
	mgr.db.Close()
	return nil
}

func (mgr *NoteManager) Handler() http.Handler {
	return mgr.handler
}

func (mgr *NoteManager) run() {
	var cmd interface{}
	var ok bool

	for {
		select {
		case cmd, ok = <-mgr.commands:
			if !ok {
				break
			}
			mgr.errors <- mgr.processCmd(cmd)
		}
	}

	// This indicates our run loop is done
	close(mgr.done)
}

func (mgr *NoteManager) processCmd(cmd interface{}) error {
	var responseMessage string
	var responseObject interface{}

	log.WithField("cmd", cmd).Debug("Got command")
	switch v := cmd.(type) {
	case cmdAddNotes:
		// Add to the database
		newNotes := []*Note{}
		for _, note := range v.Notes {
			// Only copy over the input fields that we expect.
			newNote := &Note{
				Title: note.Title,
				Text:  note.Text,
			}
			newNotes = append(newNotes, newNote)
			mgr.db.Create(newNote)
		}

		log.WithField("notes", newNotes).Debug("Added note(s)")

		responseMessage = msgNotesAdded
		responseObject = &newNotes

	case cmdDeleteNote:
		log.WithField("id", v.Id).Debug("Deleting note")
		mgr.db.Delete(&Note{Id: v.Id})

		responseMessage = msgNoteDeleted
		responseObject = v.Id

	default:
		return errors.New("unknown command")
	}

	if responseMessage != "" {
		mgr.clientsLock.RLock()
		for _, client := range mgr.clients {
			writeMessage(client, responseMessage, responseObject)
		}
		mgr.clientsLock.RUnlock()
	}

	// TODO: error?
	return nil
}

func (mgr *NoteManager) onMessage(conn sockjs.Session) {
	log.WithFields(logrus.Fields{
		"id": conn.ID(),
	}).Info("Client connected")

	// Register this client
	mgr.clientsLock.Lock()
	mgr.clients = append(mgr.clients, conn)
	mgr.clientsLock.Unlock()

	// Send the initial data
	initialNotes := []*Note{}
	mgr.db.Find(&initialNotes)
	writeMessage(conn, msgNotesAdded, initialNotes)

	var msg string
	var err error

	for {
		if msg, err = conn.Recv(); err == nil {
			ty, data := parseMessage(msg)
			if len(ty) == 0 {
				log.WithFields(logrus.Fields{
					"id":  conn.ID(),
					"raw": msg,
				}).Warn("Invalid message format - no '|' found")
				continue
			}

			log.WithFields(logrus.Fields{
				"id":  conn.ID(),
				"msg": ty,
			}).Debug("Got message from client")

			// Send the appropriate command
			var command interface{}
			switch ty {
			case msgAddNotes:
				log.Debug("Add note command")

				var msg []*Note
				err = json.Unmarshal(data, &msg)
				if err != nil {
					log.WithFields(logrus.Fields{
						"id":    conn.ID(),
						"error": err,
					}).Warn("Could not decode add notes JSON")
					break
				}

				command = cmdAddNotes{Notes: msg}

			case msgDeleteNote:
				log.Debug("Delete note command")

				var msg int64
				err = json.Unmarshal(data, &msg)
				if err != nil {
					log.WithFields(logrus.Fields{
						"id":    conn.ID(),
						"error": err,
					}).Warn("Could not decode delete note JSON")
					break
				}

				command = cmdDeleteNote{msg}

			default:
				log.WithFields(logrus.Fields{
					"id":  conn.ID(),
					"msg": ty,
				}).Error("Unknown message type")
			}

			if command != nil {
				mgr.commands <- command

				// TODO: return me
				<-mgr.errors
			}

			continue
		}

		// TODO: unregister client

		log.WithFields(logrus.Fields{
			"id":    conn.ID(),
			"error": err,
		}).Error("Could not receive SockJS message, disconnecting...")
		break
	}
}
