/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');
var _ = require('underscore')._;

var NoteItem = require('./NoteItem.jsx');
var ListItem = require('./ListItem.jsx');


var ItemList = React.createBackboneClass({
    render: function() {
        var itemNodes = this.getModel().map(function(item) {
            if( item.get('type') === 'note' ) {
                return <NoteItem
                            key={item.id}
                            model={item} />
            } else if( item.get('type') === 'list' ) {
                return <ListItem
                            key={item.id}
                            model={item} />
            }

            // TODO: some sort of error here
            return <p>Unknown item</p>
        });
        return (
            <div className="item-list">
                {itemNodes}
            </div>
        );
    }
});


module.exports = ItemList;
