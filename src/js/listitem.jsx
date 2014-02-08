/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore')._;

var ListItemEntry = require('./listitementry.jsx');


var ListItem = React.createClass({
    render: function() {
        var todoNodes = this.props.items.map(function(item, index) {
            return <ListItemEntry item={item} key={index} />
        });

        return (
            <div className="list-item">
                {todoNodes}
            </div>
        );
    },
});


module.exports = ListItem;
