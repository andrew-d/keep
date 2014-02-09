var Backbone = require('backbone');

var NoteItem = Backbone.Model.extend({
    defaults: {
        type: 'note',
        title: '',
        contents: ''
    }
});

module.exports = NoteItem;
