var Backbone = require('backbone');

var NoteItem = Backbone.Model.extend({
    defaults: {
        type: 'note',
        contents: ''
    }
});

module.exports = NoteItem;
