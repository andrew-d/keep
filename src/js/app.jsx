/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');

var Header = require('./Header.jsx');
var EditBox = require('./EditBox.jsx');
var ItemList = require('./ItemList.jsx');
var ItemCollection = require('./models/ItemCollection.js');


var Application = React.createClass({
    componentWillMount: function() {
        this.items = new ItemCollection();
        this.items.fetch({reset: true});
    },
    render: function() {
        return (
            <div className="container">
                <Header />
                <EditBox coll={this.items} />
                <ItemList model={this.items} />
            </div>
        );
    }
});

// Expose the application to the user.
module.exports = Application;
