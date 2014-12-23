package main

const (
	// Client requests
	msgAddNotes   = "add notes"
	msgDeleteNote = "delete note"

	// Server notifications
	msgNotesAdded  = "notes added"
	msgNoteDeleted = "note deleted"
)

// Add a new note.
type cmdAddNotes struct {
	Notes []*Note `json:"notes"`
}

// Delete a note
type cmdDeleteNote struct {
	Id int64 `json:"id"`
}
