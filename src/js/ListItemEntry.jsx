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
        var inputStyle = {
            textDecoration: this.state.checked ? 'line-through' : '',
        };

        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="input-group">
                        <span className="input-group-addon">
                            <input type="checkbox"
                               checked={this.state.checked}
                               onChange={this.handleChange}
                               ref='check' />
                        </span>
                        <input type="text"
                            className="form-control"
                            value={this.getModel().get('text')}
                            style={inputStyle}
                            ref="input" />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ListItemEntry;
