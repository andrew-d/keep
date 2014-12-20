package main

import (
	"errors"
	"net/http"

	"github.com/Sirupsen/logrus"
	"github.com/jinzhu/gorm"
	"github.com/nrandell/go-socket.io"
)

// The manager for all note updates
type NoteManager struct {
	// Serialize all modifications through these
	commands chan interface{}
	errors   chan error

	// Internal components
	db         gorm.DB
	sockServer *socketio.Server

	// Signalled when the run loop is done
	done chan struct{}
}

// Add a new note.
type cmdAddNotes struct {
	notes []*Note
}

// Delete a note
type cmdDeleteNote struct {
	id int64
}

func NewNoteManager() (*NoteManager, error) {
	var err error

	log.WithFields(logrus.Fields{
		"dbtype": flagDbType,
		"dbconn": flagDbConn,
	}).Debug("Opening database")

	db, err = gorm.Open(flagDbType, flagDbConn)
	if err != nil {
		log.WithField("error", err).Fatal("Could not open database")
		return nil, err
	}

	// Create tables, add columns.  Note that this will not delete columns.
	db.AutoMigrate(&Note{})

	// "nil" means we use the default transports
	sockServer, err = socketio.NewServer(nil)
	if err != nil {
		log.WithField("error", err).Fatal("Could not create Socket.IO server")
		return nil, err
	}

	ret := &NoteManager{
		commands:   make(chan interface{}),
		errors:     make(chan error),
		db:         db,
		sockServer: sockServer,
	}

	go ret.run()

	return ret, nil
}

func (mgr *NoteManager) Close() error {
	// Ensure the run loop is stopped before we close resources
	close(mgr.commands)
	<-mgr.done

	mgr.db.Close()
	// TODO: close sockServer
	return nil
}

func (mgr *NoteManager) Handler() http.Handler {
	return mgr.sockServer
}

func (mgr *NoteManager) run() {
	for {
		select {
		case cmd, ok := <-mgr.commands:
			if !ok {
				break
			}
			mgr.errors <- mgr.processCmd(cmd)
		}
	}

	close(mgr.done)
}

func (mgr *NoteManager) processCmd(cmd interface{}) error {
	switch v := cmd.(type) {
	case cmdAddNotes:
		newNotes := []*Note{}
		for _, note := range v.notes {
			// Only copy over the input fields that we expect.
			newNote := &Note{
				Title: note.Title,
				Text:  note.Text,
			}
			newNotes = append(newNotes, newNote)
			mgr.db.Create(newNote)
		}
		return nil

	case cmdDeleteNote:
		log.WithField("id", v.id).Debug("Deleting note")
		mgr.db.Delete(&Note{Id: v.id})
		return nil

	default:
		return errors.New("unknown command")
	}
}
