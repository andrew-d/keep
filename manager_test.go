package main

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ = fmt.Println

func dummyManager() *NoteManager {
	mgr, err := NewNoteManager("sqlite3", ":memory:", "")
	if err != nil {
		panic(err)
	}

	return mgr
}

func (mgr *NoteManager) AllNotes() []*Note {
	var n []*Note
	mgr.db.Order("id asc").Find(&n)
	return n
}

func (n *Note) Equal(other *Note) bool {
	if n.Id != other.Id {
		fmt.Printf("Our ID (%d) != Other ID (%d)\n", n.Id, other.Id)
		return false
	}

	if n.Title != other.Title {
		fmt.Printf("Our Title (%s) != Other Title (%s)\n", n.Title, other.Title)
		return false
	}

	if n.Text != other.Text {
		fmt.Printf("Our Text (%s) != Other Text (%s)\n", n.Text, other.Text)
		return false
	}

	if n.Revision != other.Revision {
		fmt.Printf("Our Revision (%d) != Other Revision (%d)\n", n.Revision, other.Revision)
		return false
	}

	return true
}

func TestBasicAdd(t *testing.T) {
	mgr := dummyManager()
	defer mgr.Close()

	mgr.processCmd(cmdAddNotes{[]*Note{
		{Id: 1, Title: "hello", Text: "some text"},
	}})

	notes := mgr.AllNotes()
	assert.Len(t, notes, 1)
	assert.True(t, (&Note{
		Id:       1,
		Title:    "hello",
		Text:     "some text",
		Revision: 1,
	}).Equal(notes[0]))
}

func TestCanDelete(t *testing.T) {
	mgr := dummyManager()
	defer mgr.Close()

	mgr.processCmd(cmdAddNotes{[]*Note{
		{Id: 1, Title: "hello", Text: "some text"},
	}})
	mgr.processCmd(cmdDeleteNote{Id: 1, Revision: 1})

	notes := mgr.AllNotes()
	assert.Len(t, notes, 0)
}

func TestDeleteWithBadRevision(t *testing.T) {
	mgr := dummyManager()
	defer mgr.Close()

	mgr.processCmd(cmdAddNotes{[]*Note{
		{Id: 1, Title: "hello", Text: "some text"},
	}})
	mgr.db.First(&Note{}, 1).Update("revision", 1234)
	mgr.processCmd(cmdDeleteNote{Id: 1, Revision: 1230})

	// The delete should not have been processed
	notes := mgr.AllNotes()
	assert.Len(t, notes, 1)
}

func TestCanModify(t *testing.T) {
	mgr := dummyManager()
	defer mgr.Close()

	mgr.processCmd(cmdAddNotes{[]*Note{
		{Id: 1, Title: "hello", Text: "some text"},
	}})
	mgr.processCmd(cmdModifyNote{
		Id:       1,
		Title:    "new title",
		Text:     "new text",
		Revision: 1,
	})

	notes := mgr.AllNotes()
	assert.Len(t, notes, 1)
	assert.True(t, (&Note{
		Id:       1,
		Title:    "new title",
		Text:     "new text",
		Revision: 2,
	}).Equal(notes[0]))
}

func TestModifyWithBadRevision(t *testing.T) {
	mgr := dummyManager()
	defer mgr.Close()

	mgr.processCmd(cmdAddNotes{[]*Note{
		{Id: 1, Title: "hello", Text: "some text"},
	}})
	mgr.db.First(&Note{}, 1).Update("revision", 1234)
	mgr.processCmd(cmdModifyNote{
		Id:       1,
		Title:    "new title",
		Text:     "new text",
		Revision: 1230,
	})

	// There should be 2 notes now, one from the conflict
	notes := mgr.AllNotes()
	assert.Len(t, notes, 2)
	assert.True(t, (&Note{
		Id:       1,
		Title:    "hello",
		Text:     "some text",
		Revision: 1234,
	}).Equal(notes[0]))
	assert.True(t, (&Note{
		Id:       2,
		Title:    "new title (conflict)",
		Text:     "new text",
		Revision: 1231,
	}).Equal(notes[1]))
}
