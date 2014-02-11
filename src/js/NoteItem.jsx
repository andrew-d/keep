/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');


var NoteItem = React.createBackboneClass({
    render: function() {
        var contents = [
            <div className="panel-body">
                {this.getModel().get('text')}
            </div>
        ];
        var title = this.getModel().get('title');
        if( title && title.length > 0 ) {
            // TODO: add close button somewhere on untitled notes
            contents.unshift(
                <div className="panel-heading">
                    {title}
                    <div className="pull-right">
                        <button type="button" className="close" aria-hidden="true">&times;</button>
                    </div>
                </div>
            );
        }

        // TODO: add 'key's to stop warning?
        return (
            <div className="item panel panel-default">
                {contents}
            </div>
        );
    },
});


module.exports = NoteItem;
