/** @jsx React.DOM */
var React = require('react');


var NoteItem = React.createClass({
    render: function() {
        return (
            <div className="note-item">
                {this.props.contents}
            </div>
        );
    },
});


module.exports = NoteItem;
