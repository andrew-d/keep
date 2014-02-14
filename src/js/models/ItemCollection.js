var Backbone = require('backbone');

var NoteItem = require('./NoteItem.js');
var ListItem = require('./ListItem.js');

var ItemCollection = Backbone.Collection.extend({
    url: '/api/items',

    model: function(attrs, options) {
        if( attrs.type === 'note' ) {
            return new NoteItem(attrs, options);
        } else if( attrs.type === 'list' ) {
            return new ListItem(attrs, options);
        }

        // TODO: error here
        console.error("unknown type: " + attrs.type);
        return null;
    },

    comparator: 'timestamp'
});

module.exports = ItemCollection;
