var Backbone = require('backbone');

var ListItemEntry = require('./ListItemEntry.js');

var ListItemEntryCollection = Backbone.Collection.extend({
    model: ListItemEntry
});

module.exports = ListItemEntryCollection;
