/** @jsx React.DOM */
var React = require('react');

var NoteItem = require('./models/NoteItem.js');


var EditBox = React.createClass({
    handleSubmit: function() {
        var title = this.refs.title.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();

        var coll = this.props.coll;

        // Optimistically create and add the model, and, if the save fails,
        // back out the change.
        // TODO: report this error to the user rather than have the item just
        // mysteriously disappear... maybe have a 'saved' flag on the model?
        var model = coll.create({
            type: 'note',
            title: title,
            text: text
        }, {
            error: function(model, xhr, options) {
                // This is only triggered if the model failed to save.  If so,
                // we remove this model from the collection.
                coll.remove(model);
            },
        });

        return false;
    },

    render: function() {
        return (
            <form role="form" className="newForm" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Title" ref="title" />
              </div>
              <div className="form-group">
                <textarea className="form-control" ref="text">
                </textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
        );
    }
});


module.exports = EditBox;
