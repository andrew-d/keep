var Backbone = require('backbone');
var BaseModel = require('./BaseModel.js');

var BaseItem = BaseModel.extend({
    defaults: function() {
        return {
            title: '',
            timestamp: 0,
        };
    },

    onError: function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('error');
        Backbone.trigger.apply(Backbone, args);
    },

    initialize: function() {
        this.set('timestamp', new Date().getTime());
        this.on('error', this.onError);
    },

    destroy: function() {
        this.off('error', this.onError);
    }
});

module.exports = BaseItem;
