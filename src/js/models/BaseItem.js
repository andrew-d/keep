var Backbone = require('backbone');

var BaseItem = Backbone.Model.extend({
    defaults: function() {
        return {
            title: '',
            timestamp: 0,
        };
    }
});

module.exports = BaseItem;
