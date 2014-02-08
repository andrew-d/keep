var Backbone = require('backbone');

var ListItemEntry = Backbone.Model.extend({
    defaults: {
        text: '',
        checked: false
    }
});

module.exports = ListItemEntry;
