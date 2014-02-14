var Backbone = require('backbone');

var BaseModel = Backbone.Model.extend({
    // Override this function to control what attributes are sent to the server
    // when sync() is called.
    toRemoteJSON: function() {
        var payload = this.toJSON();
        return payload;
    },

    // This just delegates to Backbone.sync, but calls this.toRemoteJSON() to
    // obtain the attributes to send on update / create.
    sync: function(method, model, options) {
        if( method == 'update' || method == 'create' ) {
            var newModel = this.clone();
            newModel.clear({silent: true});
            newModel.set(this.toRemoteJSON(), {silent: true});
            return Backbone.sync.call(newModel, method, newModel, options);
        } else {
            return Backbone.sync.call(this, method, this, options);
        }
    }
});

module.exports = BaseModel;
