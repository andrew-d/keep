var React = require('react'),
    marked = require('marked'),
    $ = require('jquery');


var Markdown = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    propTypes: {
        markdown: React.PropTypes.string.isRequired,

        taskChanged: React.PropTypes.func,
    },

    render: function() {
        var renderer = new marked.Renderer(),
            counter = 0;

        renderer.listitem = function(text) {
            if (/^\s*\[[x ]\]\s*/.test(text)) {
                var count = counter++,
                    dataAttr = 'data-list-entry="' + count + '"';
                    enabledHtml  = '<input class="task-list-item-checkbox" type="checkbox" ' + dataAttr + '> ',
                    disabledHtml = '<input class="task-list-item-checkbox" type="checkbox" ' + dataAttr + ' disabled> ',

                text = text
                        .replace(/^\s*\[ \]\s*/, enabledHtml)
                        .replace(/^\s*\[x\]\s*/, disabledHtml);

                return '<li class="task-list-item">' + text + '</li>\n';
            } else {
                return '<li>' + text + '</li>\n';
            }
        };

        // Render to markdown.
        var rendered = marked(this.props.markdown, {
            renderer: renderer,
        });

        return <div className="markdown"
                    dangerouslySetInnerHTML={{__html: rendered}}></div>;
    },

    componentDidMount: function() {
        $('input[type="checkbox"]', this.getDOMNode()).on('click', this.handleTaskClick);
    },

    componentWillUnmount: function() {
        $('input[type="checkbox"]', this.getDOMNode()).off('click', this.handleTaskClick);
    },

    handleTaskClick: function(e) {
        e.stopPropagation();
        if( !this.props.taskChanged ) return;

        this.props.taskChanged(+e.target.attributes['data-list-entry'].value,
                               e.target.checked);
    },
});

module.exports = Markdown;
