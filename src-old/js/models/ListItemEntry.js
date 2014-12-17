var BaseModel = require('./BaseModel.js');

var ListItemEntry = BaseModel.extend({
    defaults: {
        text: '',
        checked: false
    }
});

module.exports = ListItemEntry;
