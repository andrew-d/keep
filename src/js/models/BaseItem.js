var BaseModel = require('./BaseModel.js');

var BaseItem = BaseModel.extend({
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
