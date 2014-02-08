var Backbone = require('backbone');

var ListItemEntry = require('./listitementry.js');

var ListItemEntryCollection = Backbone.Collection.extend({
    model: ListItemEntry
});

module.exports = ListItemEntryCollection;
