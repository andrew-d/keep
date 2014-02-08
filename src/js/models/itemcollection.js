var Backbone = require('backbone');

var NoteItem = require('./noteitem.js');
var ListItem = require('./listitem.js');

var ItemCollection = Backbone.Collection.extend({
    model: function(attrs, options) {
        if( attrs.type === 'note' ) {
            return new NoteItem(attrs, options);
        } else if( attrs.type === 'list' ) {
            return new ListItem(attrs, options);
        }

        // TODO: error here
    }
});

module.exports = ItemCollection;
