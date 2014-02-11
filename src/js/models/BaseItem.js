var Backbone = require('backbone');

var BaseItem = Backbone.Model.extend({
    defaults: function() {
        return {
            title: '',
            timestamp: 0,
        };
    },

    initialize: function() {
        this.set('timestamp', new Date().getTime());
    }
});

module.exports = BaseItem;
