/** @jsx React.DOM */
var React = require('react');

var Header = require('./header.jsx');
var EditBox = require('./editbox.jsx');
var ItemList = require('./itemlist.jsx');


var Application = React.createClass({
    render: function() {
        return (
            <div className="container">
                <Header />
                <EditBox />
                <ItemList />
            </div>
        );
    }
});

// Expose the application to the user.
module.exports = Application;
