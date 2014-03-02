/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');


var Item = React.createBackboneClass({
    handleClose: function() {
        this.getModel().destroy();
    },

    render: function() {
        var item = this.getModel();

        // TODO: make this render Markdown
        itemBody = (
            <div className="item-body">
                {this.getModel().get('text')}
            </div>
        );

        var closeButton = (
            <div className="pull-right">
                <button
                    type="button"
                    className="close"
                    aria-hidden="true"
                    onClick={this.handleClose}>&times;</button>
            </div>
        );

        // Add the item header only if there's a title.
        var title = item.get('title');
        var itemHeader = null;
        if( title && title.length > 0 ) {
            itemHeader = (
                <div className="panel-heading">
                    <b>{title}</b>
                    {closeButton}
                </div>
            );
        } else {
            // There's no header, so we need to render the close button in the
            // main body.
            //itemBody = [itemBody, closeButton];
            // TODO: figure out a way to do this without wrapping text
        }

        return (
            <div className="panel panel-default">
                {itemHeader}
                <div className="panel-body">
                    {itemBody}
                </div>
            </div>
        );
    }
});

module.exports = Item;
