package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"sync"

	"github.com/Sirupsen/logrus"
	"github.com/blevesearch/bleve"
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

	// Indexing
	index     bleve.Index
	indexLock sync.RWMutex

	// Signalled to exit everything
	finish chan struct{}

	// Used to control when things are done
	wg sync.WaitGroup
}

func NewNoteManager(dbType, dbConn, indexPath string) (*NoteManager, error) {
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

	// Create our index, if we have a path for it.
	var noteIndex bleve.Index
	if indexPath != "" {
		noteIndex, err = bleve.Open(indexPath)
		if err == bleve.ErrorIndexPathDoesNotExist {
			log.WithField("path", indexPath).Info("Index does not exist - creating...")

			indexMapping := buildIndexMapping()
			noteIndex, err = bleve.New(indexPath, indexMapping)
			if err != nil {
				log.WithField("error", err).Error("Could not create index")
				return nil, err
			}
		} else if err != nil {
			log.WithFields(logrus.Fields{
				"error": err,
				"path":  indexPath,
			}).Error("Could not open index")
			return nil, err
		} else {
			log.WithField("path", indexPath).Info("Opened existing index")
		}
	} else {
		log.Info("Not opening or creating index")
	}

	// Create the final NoteManager.
	ret := &NoteManager{
		commands: make(chan interface{}),
		errors:   make(chan error),
		db:       db,
		index:    noteIndex,
		finish:   make(chan struct{}),
	}
	ret.handler = sockjs.NewHandler("/api/sockjs", sockjs.DefaultOptions, ret.onMessage)

	// Start the command-processing loop
	ret.wg.Add(1)
	go ret.run()

	// Index note data in the background
	if indexPath != "" {
		ret.wg.Add(1)
		go ret.periodicIndex()
	}

	return ret, nil
}

func (mgr *NoteManager) Close() error {
	// Wait for background goroutines to finish.
	close(mgr.finish)
	mgr.wg.Wait()

	// Shut down all clients
	mgr.clientsLock.Lock()
	for _, client := range mgr.clients {
		// TODO: proper reason?
		client.Close(204, "shutting down")
	}
	mgr.clients = nil
	mgr.clientsLock.Unlock()

	// Close all remaining resources
	mgr.db.Close()
	return nil
}

func (mgr *NoteManager) Handler() http.Handler {
	return mgr.handler
}

func (mgr *NoteManager) run() {
	defer mgr.wg.Done()

	var cmd interface{}

	for {
		select {
		case cmd = <-mgr.commands:
			mgr.errors <- mgr.processCmd(cmd)
		case <-mgr.finish:
			return
		}
	}
}

func (mgr *NoteManager) processCmd(cmd interface{}) error {
	var responseMessage string
	var responseObject interface{}

	switch v := cmd.(type) {
	case cmdAddNotes:
		// Add to the database
		newNotes := []*Note{}
		for _, note := range v.Notes {
			// Only copy over the input fields that we expect.
			newNote := &Note{
				Title:    note.Title,
				Text:     note.Text,
				Revision: 1,
			}
			newNotes = append(newNotes, newNote)
			mgr.db.Create(newNote)
		}

		log.WithField("notes", newNotes).Debug("Added note(s)")

		responseMessage = msgNotesAdded
		responseObject = &newNotes

	case cmdDeleteNote:
		log.WithFields(logrus.Fields{
			"id":       v.Id,
			"revision": v.Revision,
		}).Debug("Deleting note")

		// Load the note with the given ID.
		var note Note
		mgr.db.Find(&note, v.Id)

		// If the revision isn't correct, then we do nothing
		if note.Revision == v.Revision {
			mgr.db.Delete(&note)

			responseMessage = msgNoteDeleted
			responseObject = v.Id
		} else {
			// TODO: what message should we return?
		}

	case cmdModifyNote:
		log.WithFields(logrus.Fields{
			"id":       v.Id,
			"revision": v.Revision,
		}).Debug("Modifying note")

		// Load the note with the given ID.
		var note Note
		mgr.db.Find(&note, v.Id)

		// If the revision isn't correct, then we do nothing
		if note.Revision == v.Revision {
			note.Title = v.Title
			note.Text = v.Text
			note.Revision++

			mgr.db.Save(&note)

			responseMessage = msgNoteModified
			responseObject = &note
		} else {
			newNote := &Note{
				Title:    v.Title + " (conflict)",
				Text:     v.Text,
				Revision: v.Revision + 1,
			}

			mgr.db.Create(newNote)

			responseMessage = msgNotesAdded
			responseObject = []*Note{newNote}
		}

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
	// Register this client
	mgr.clientsLock.Lock()
	mgr.clients = append(mgr.clients, conn)
	log.WithFields(logrus.Fields{
		"id":           conn.ID(),
		"totalClients": len(mgr.clients),
	}).Info("Client connected")
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
				var msg cmdDeleteNote

				err = json.Unmarshal(data, &msg)
				if err != nil {
					log.WithFields(logrus.Fields{
						"id":    conn.ID(),
						"error": err,
					}).Warn("Could not decode delete note JSON")
					break
				}

				command = msg

			case msgModifyNote:
				var msg cmdModifyNote

				err = json.Unmarshal(data, &msg)
				if err != nil {
					log.WithFields(logrus.Fields{
						"id":    conn.ID(),
						"error": err,
					}).Warn("Could not decode modify note JSON")
					break
				}

				command = msg

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

		if err != sockjs.ErrSessionNotOpen {
			log.WithFields(logrus.Fields{
				"id":    conn.ID(),
				"error": err,
			}).Error("Could not receive SockJS message, disconnecting...")
		}

		// The client disconnected, unregister them.
		mgr.clientsLock.Lock()

		// Find the client
		var idx int = -1
		for i, client := range mgr.clients {
			if client == conn {
				idx = i
			}
		}

		// Remove it
		mgr.clients = append(mgr.clients[:idx], mgr.clients[idx+1:]...)
		log.WithFields(logrus.Fields{
			"id":           conn.ID(),
			"totalClients": len(mgr.clients),
		}).Info("Client disconnected")

		mgr.clientsLock.Unlock()

		break
	}
}
