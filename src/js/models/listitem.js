var Backbone = require('backbone');

var ListItem = Backbone.Model.extend({
    defaults: {
        type: 'list',
        items: []
        // TODO: more here
    }
});

module.exports = ListItem;
