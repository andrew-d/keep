/** @jsx React.DOM */
var _ = require('underscore')._;
var React = require('react');


var ListItemEntry = React.createClass({
    getInitialState: function() {
        return {checked: this.props.item.checked};
    },
    handleChange: function(event) {
        this.setState({checked: event.target.checked});
        // TODO: update model somehow
    },
    render: function() {
        return (
            <div className="checkbox">
                <input type='checkbox'
                       checked={this.state.checked}
                       onChange={this.handleChange}
                       value=''
                       ref='check' />
                {this.props.item.text}
            </div>
        );
    }
});

module.exports = ListItemEntry;
