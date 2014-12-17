/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');


var NoteItem = React.createBackboneClass({
    render: function() {
        return (
            <div className="note-body">
                {this.getModel().get('text')}
            </div>
        );
    }
});


module.exports = NoteItem;
