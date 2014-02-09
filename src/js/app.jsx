/** @jsx React.DOM */
var React = require('react');

var Header = require('./Header.jsx');
var EditBox = require('./EditBox.jsx');
var ItemList = require('./ItemList.jsx');
var ItemCollection = require('./models/ItemCollection.js');

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
    },
    {
        id: 3,
        type: 'note',
        title: 'Item 3',
        contents: 'three'
    },
    {
        id: 4,
        type: 'note',
        title: 'Item 4',
        contents: 'four'
    },
    {
        id: 5,
        type: 'note',
        title: 'Item 5',
        contents: 'five'
    }
]);


var Application = React.createClass({
    render: function() {
        return (
            <div className="container">
                <Header />
                <EditBox coll={items} />
                <ItemList model={items} />
            </div>
        );
    }
});

// Expose the application to the user.
module.exports = Application;
