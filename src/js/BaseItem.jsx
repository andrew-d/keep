/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');

var NoteItem = require('./NoteItem.jsx');
var ListItem = require('./ListItem.jsx');


var BaseItem = React.createBackboneClass({
    render: function() {
        var item = this.getModel();

        // Add the item header only if there's a title.
        var title = item.get('title');
        var itemHeader = null;
        if( title && title.length > 0 ) {
            // TODO: add close button somewhere on untitled notes
            itemHeader = (
                <div className="panel-heading">
                    {title}
                    <div className="pull-right">
                        <button type="button" className="close" aria-hidden="true">&times;</button>
                    </div>
                </div>
            );
        }

        // Depending on the model type, render the appropriate component.
        var type = item.get('type');
        var itemBody;
        if( 'note' === type ) {
            itemBody = <NoteItem key={item.id} model={item} />;
        } else if( 'list' === type ) {
            itemBody = <ListItem key={item.id} model={item} />;
        } else {
            itemBody = <p>Unknown item type</p>;
        }

        return (
            <div className="item panel panel-default">
                {itemHeader}
                <div className="panel-body">
                    {itemBody}
                </div>
            </div>
        );
    }
});

module.exports = BaseItem;
