var Backbone = require('backbone');

var Item = require('./Item.js');

var ItemCollection = Backbone.Collection.extend({
    url: '/api/items',
    model: Item,
    comparator: 'timestamp'
});

module.exports = ItemCollection;
