/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');
var _ = require('underscore')._;

var ListItemEntry = require('./ListItemEntry.jsx');


var ListItem = React.createBackboneClass({
    render: function() {
        var items = this.getModel().entries;
        var todoNodes = items.map(function(item, index) {
            return <ListItemEntry model={item} key={index} />
        });

        return (
            <div>
                {todoNodes}
            </div>
        );
    },
});


module.exports = ListItem;
