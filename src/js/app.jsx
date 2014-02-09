/** @jsx React.DOM */
var React = require('react');

var Header = require('./Header.jsx');
var EditBox = require('./EditBox.jsx');
var ItemList = require('./ItemList.jsx');


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
