/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');
var marked = require('marked');


// TODO: consider listening to the model and caching the rendered
// markdown so we don't need to do it every time.
var Item = React.createBackboneClass({
    componentWillMount: function() {
        // TODO: highlighting
        marked.setOptions({
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
        });
    },

    handleClose: function() {
        this.getModel().destroy();
    },

    handleClick: function(e) {
        if( e.target.tagName.toLowerCase() !== 'input' ||
            e.target.type.toLowerCase() !== 'checkbox' )
        {
            return;
        }

        var index = +e.target.attributes['data-item-index'].value;

        // TODO: need to map this back to the original list entry.
        // Note that this index (as of 2014-03-01) starts from 1,
        // resetting on each new task list.
        console.log("checkbox click triggered on index: " + index);
    },

    render: function() {
        var item = this.getModel();

        var rendered = marked(item.get('text'));
        var itemBody = (
            <div
                className="item-body"
                onClick={this.handleClick}
                dangerouslySetInnerHTML={{
                    __html: rendered
                }}
            >
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
