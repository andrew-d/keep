/** @jsx React.DOM */
var _ = require('underscore')._;
var React = require('react');


var ListItemEntry = React.createClass({
    getInitialState: function() {
        return {checked: this.props.item.get('checked')};
    },
    handleChange: function(event) {
        var n = event.target.checked;

        this.setState({checked: n});
        this.props.item.set('checked', n);
    },
    render: function() {
        return (
            <div className="checkbox">
                <input type='checkbox'
                       checked={this.state.checked}
                       onChange={this.handleChange}
                       value=''
                       ref='check' />
                {this.props.item.get('text')}
            </div>
        );
    }
});

module.exports = ListItemEntry;
