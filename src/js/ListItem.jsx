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

        var contents = [
            <div className="panel-body">
                {todoNodes}
            </div>
        ];
        var title = this.getModel().get('title');
        if( title && title.length > 0 ) {
            contents.unshift(<div className="panel-heading">{title}</div>);
        }

        // TODO: add 'key's to stop warning?
        return (
            <div className="item panel panel-default">
                {contents}
            </div>
        );
    },
});


module.exports = ListItem;
