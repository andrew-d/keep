/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');

var NoteItem = require('./NoteItem.jsx');
var ListItem = require('./ListItem.jsx');


var BaseItem = React.createBackboneClass({
    handleClose: function() {
        // TODO: do stuff here
        console.log('Close ' + this.getModel().id);
    },

    render: function() {
        var item = this.getModel();

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

        var closeButton = (
            <div className="pull-right">
                <button
                    type="button"
                    className="close"
                    aria-hidden="true"
                    onClick={this.handleClose}>&times;</button>
            </div>
        );

        // Add the item header only if there's a title.
        var title = item.get('title');
        var itemHeader = null;
        if( title && title.length > 0 ) {
            itemHeader = (
                <div className="panel-heading">
                    <b>{title}</b>
                    {closeButton}
                </div>
            );
        } else {
            // There's no header, so we need to render the close button in the
            // main body.
            //itemBody = [itemBody, closeButton];
            // TODO: figure out a way to do this without wrapping text
        }

        return (
            <div className="panel panel-default">
                {itemHeader}
                <div className="panel-body">
                    {itemBody}
                </div>
            </div>
        );
    }
});

module.exports = BaseItem;
