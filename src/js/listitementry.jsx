/** @jsx React.DOM */
var React = require('react');
var _ = require('react_backbone');
var _ = require('underscore')._;


var ListItemEntry = React.createBackboneClass({
    getInitialState: function() {
        return {checked: this.getModel().get('checked')};
    },
    handleChange: function(event) {
        var n = event.target.checked;

        this.setState({checked: n});
        this.getModel().set('checked', n);
    },
    render: function() {
        return (
            <div className="checkbox">
                <input type='checkbox'
                       checked={this.state.checked}
                       onChange={this.handleChange}
                       value=''
                       ref='check' />
                {this.getModel().get('text')}
            </div>
        );
    }
});

module.exports = ListItemEntry;
