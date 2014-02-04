/** @jsx React.DOM */
var React = require('react');
var Application = React.createClass({
    render: function() {
        return (
            <div className="test">
                Hello world
            </div>
        );
    },
});

// Expose the application to the user.
module.exports = Application;
