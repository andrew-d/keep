/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore')._;

var NoteItem = require('./noteitem.jsx');
var ListItem = require('./listitem.jsx');
var ItemCollection = require('./models/itemcollection.js');


var ItemList = React.createClass({
    render: function() {
        // TODO: retrieve these from the server
        var items = new ItemCollection([
            {
                id: 1,
                type: 'note',
                title: 'Note Title',
                contents: 'foobar'
            },
            {
                id: 2,
                type: 'list',
                title: 'List Title',
                items: [
                    {text: 'One', checked: false},
                    {text: 'Two', checked: false},
                    {text: 'Three', checked: true}
                ]
            }
        ]);

        var itemNodes = items.map(function(item) {
            if( item.get('type') === 'note' ) {
                return <NoteItem
                            key={item.id}
                            model={item} />
            } else if( item.get('type') === 'list' ) {
                return <ListItem
                            key={item.id}
                            model={item}
                            items={item.entries} />
            }

            // TODO: some sort of error here
            return <p>Unknown item</p>
        });
        return (
            <div className="item-list">
                <ul>
                    {itemNodes}
                </ul>
            </div>
        );
    }
});


module.exports = ItemList;
