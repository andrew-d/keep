package main

const (
	// Client requests
	msgAddNotes   = "add notes"
	msgDeleteNote = "delete note"
	msgModifyNote = "modify note"

	// Server notifications
	msgNotesAdded   = "notes added"
	msgNoteDeleted  = "note deleted"
	msgNoteModified = "note modified"
)

// Add a new note.
type cmdAddNotes struct {
	Notes []*Note `json:"notes"`
}

// Delete a note
type cmdDeleteNote struct {
	Id       int64 `json:"id"`
	Revision int64 `json:"revision"`
}

type cmdModifyNote struct {
	Id       int64  `json:"id"`
	Title    string `json:"title"`
	Text     string `json:"text"`
	Revision int64  `json:"revision"`
}
