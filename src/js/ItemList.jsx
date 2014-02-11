/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');
var _ = require('underscore')._;

var BaseItem = require('./BaseItem.jsx');


var ItemList = React.createBackboneClass({
    render: function() {
        var itemNodes = this.getModel().map(function(item) {
            return <BaseItem
                        key={item.id}
                        model={item} />
        });
        return (
            <div className="item-list">
                {itemNodes}
            </div>
        );
    }
});


module.exports = ItemList;
