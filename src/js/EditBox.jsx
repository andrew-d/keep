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

    handleFocus: function(e) {
        this.refs.titleBox.getDOMNode().style.display = '';
        this.refs.submitButton.getDOMNode().style.display = '';
        return false;
    },

    handleBlur: function(e) {
        // TODO: Figure out if we're to hide this element.
        // this.refs.titleBox.getDOMNode().style.display = 'none';
        // this.refs.submitButton.getDOMNode().style.display = 'none';
        return false;
    },

    render: function() {
        var noDisplay = {display: 'none'};
        return (
            <form role="form" className="newForm" onSubmit={this.handleSubmit}>
              <div className="form-group" style={noDisplay} ref="titleBox">
                <input type="text" className="form-control" onBlur={this.handleBlur}
                    placeholder="Title" ref="title" />
              </div>
              <div className="form-group">
                <textarea className="form-control" ref="text"
                    onFocus={this.handleFocus} onBlur={this.handleBlur}
                    placeholder="Add note">
                </textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={noDisplay} ref='submitButton'>
                Add
              </button>
            </form>
        );
    }
});


module.exports = EditBox;
