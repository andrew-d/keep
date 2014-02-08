/** @jsx React.DOM */
var React = require('react');


var EditBox = React.createClass({
    handleSubmit: function() {
        var title = this.refs.title.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();

        alert(title + ": " + text);

        return false;
    },

    render: function() {
        return (
            <form role="form" className="newForm" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Title" ref="title" />
              </div>
              <div className="form-group">
                <textarea className="form-control" ref="text">
                </textarea>
              </div>
              <button type="submit" className="btn btn-default">
                Done
              </button>
            </form>
        );
    }
});


module.exports = EditBox;
