/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore')._;

var Item = require('./models/Item.js');


var EditBox = React.createClass({
    handleSubmit: function() {
        var title = this.refs.title.getDOMNode().value.trim(),
            coll = this.props.coll,
            text = this.refs.text.getDOMNode().value.trim();

        // Optimistically create and add the model, and, if the save fails,
        // back out the change.
        // TODO: report this error to the user rather than have the item just
        // mysteriously disappear... maybe have a 'saved' flag on the model?
        var model = coll.create({
            title: title,
            text: text
        }, {
            // success: function(model, response, options) {
            //     console.log(response);
            //     model.set('timestamp', response.timestamp);
            // },
            error: function(model, xhr, options) {
                // This is only triggered if the model failed to save.  If so,
                // we remove this model from the collection.
                coll.remove(model);
            },
        });

        return false;
    },

    render: function() {
        var theForm = (
            <form role="form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Title" ref="title" />
              </div>
              <div>
                <textarea className="form-control" ref="text" placeholder="Type text here">
                </textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
        );

        return theForm;
    }
});


module.exports = EditBox;
