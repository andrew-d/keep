var Reflux = require('reflux');
var socket = require('./socket');


var NoteActions = Reflux.createActions([
    'createNote',
    'deleteNote',
    'editNote',
]);


NoteActions.createNote.listen(function(title, text) {
    socket.sendMessage('add note', {
        title: title,
        text:  text,
    });
});

NoteActions.deleteNote.listen(function(id, revision) {
    socket.sendMessage('delete note', {
        id:       id,
        revision: revision,
    });
});

NoteActions.editNote.listen(function() {
    socket.sendMessage('modify note', {
        // TODO
    });
});


module.exports = NoteActions;
