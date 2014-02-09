var Backbone = require('backbone');

var ListItemEntryCollection = require('./ListItemEntryCollection.js');

var ListItem = Backbone.Model.extend({
    defaults: {
        type: 'list',
        title: ''
        // TODO: more here
    },
    constructor: function(attrs, options) {
        this.entries = new ListItemEntryCollection();

        options.parse = true;
        Backbone.Model.apply(this, arguments);
    },
    parse: function(data, options) {
        this.entries.reset(data.items);
        delete data.items;

        return data;
    }
});

module.exports = ListItem;
