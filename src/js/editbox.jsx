/** @jsx React.DOM */
var React = require('react');


var EditBox = React.createClass({
    handleSubmit: function() {
        var title = this.refs.title.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();

        console.log(title + ": " + text);

        return false;
    },

    render: function() {
        return (
            <form className="newForm" onSubmit={this.handleSubmit}>
              <input type="text" placeholder="Title" ref="title" />
              <input type="text" ref="text" />
              <input type="submit" value="Done" />
            </form>
        );
    },
});


module.exports = EditBox;
