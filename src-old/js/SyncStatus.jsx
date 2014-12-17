/** @jsx React.DOM */
var React = require('react');
var Backbone = require('backbone');

var SyncStatus = React.createClass({
    stateMappings: {
        'ok':   {klass: 'text-muted', text: ''},
        'sync': {klass: 'text-warning', text: 'Synchronizing...'},
        'done': {klass: 'text-success', text: 'Synchronized'},
        'err':  {klass: 'text-danger', text: 'Error synchronizing'}
    },

    unknownState: {
        klass: 'text-error',
        text: 'Unknown state',
    },

    getInitialState: function() {
        return {state: 'ok'};
    },

    componentWillMount: function() {
        var self = this;

        // This stores the timer that will reset the state to 'ok'
        // after a short timeout.
        self.resetState = null;
        var clearReset = function() {
            if( self.resetState !== null ) {
                clearTimeout(self.resetState);
                self.resetState = null;
            }
        };

        Backbone.on('request', function() {
            clearReset();
            self.setState({state: 'sync'});
        });
        Backbone.on('sync', function() {
            clearReset();
            self.setState({state: 'done'});

            // Reset to 'ok' in 2 seconds
            self.resetState = setTimeout(function() {
                self.setState({state: 'ok'});
            }, 2000);
        });
        Backbone.on('error', function(model, xhr, options) {
            clearReset();
            self.setState({state: 'err', errorInfo: {
                statusText: xhr.statusText,
                readyState: xhr.readyState
            }});
        });
    },

    render: function() {
        var vals = this.stateMappings[this.state.state] || this.unknownState;
        var title = '';

        if( this.state.state === 'err' ) {
            if( this.state.errorInfo.readyState === 0 ) {
                title = 'Communication error';
            } else {
                title = 'Error from server: ' + this.state.errorInfo.statusText;
            }
        }

        return (
            <div className={vals.klass} title={title}>
                {vals.text}
            </div>
        );
    }
});

module.exports = SyncStatus;
