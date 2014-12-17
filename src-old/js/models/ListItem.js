var Backbone = require('backbone');
var _        = require('underscore')._;

var BaseItem = require('./BaseItem.js');
var ListItemEntryCollection = require('./ListItemEntryCollection.js');

var ListItem = BaseItem.extend({
    defaults: function() {
        // Copy the superclass defaults and then add our own.
        return _.extend({},
            BaseItem.prototype.defaults(),
        {
            type: 'list',
            // TODO: more here
        });
    },
    constructor: function(attrs, options) {
        this.entries = new ListItemEntryCollection();

        options.parse = true;
        Backbone.Model.call(this, attrs, options);
    },
    parse: function(data, options) {
        this.entries.reset(data.items);
        delete data.items;

        return data;
    }
});

module.exports = ListItem;
