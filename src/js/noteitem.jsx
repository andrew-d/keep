/** @jsx React.DOM */
var React = require('react');


var NoteItem = React.createClass({
    render: function() {
        var contents = [
            <div className="panel-body">
                {this.props.model.get('contents')}
            </div>
        ];
        var title = this.props.model.get('title');
        if( title && title.length > 0 ) {
            contents.unshift(<div className="panel-heading">{title}</div>);
        }

        return (
            <div className="note-item panel panel-default">
                {contents}
            </div>
        );
    },
});


module.exports = NoteItem;
