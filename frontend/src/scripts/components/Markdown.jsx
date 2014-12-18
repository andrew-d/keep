var React = require('react'),


var Markdown = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    propTypes: {
        markdown: React.PropTypes.string.isRequired,
    },

    render: function() {
        return <div>Foobar</div>;
    },
});

module.exports = Markdown;
