/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore')._;

var ListItemEntry = require('./listitementry.jsx');


var ListItem = React.createClass({
    render: function() {
        var todoNodes = this.props.items.map(function(item, index) {
            return <ListItemEntry item={item} key={index} />
        });

        var contents = [
            <div className="panel-body">
                {todoNodes}
            </div>
        ];
        var title = this.props.model.get('title');
        if( title && title.length > 0 ) {
            contents.unshift(<div className="panel-heading">{title}</div>);
        }

        return (
            <div className="list-item panel panel-default">
                {contents}
            </div>
        );
    },
});


module.exports = ListItem;
