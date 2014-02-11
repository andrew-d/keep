var _        = require('underscore')._;

var BaseItem = require('./BaseItem.js');

var NoteItem = BaseItem.extend({
    defaults: function() {
        // Copy the superclass defaults and then add our own.
        return _.extend({},
            BaseItem.prototype.defaults(),
        {
            type: 'note',
            text: ''
        });
    }
});

module.exports = NoteItem;
