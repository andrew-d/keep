var React = require('react'),
    Morearty = require('morearty');


var StatusBar = React.createClass({
    displayName: 'StatusBar',
    mixins: [Morearty.Mixin],

    render: function() {
        var binding = this.getDefaultBinding(),
            connected = binding.get('connected');
            syncing = false;  // TODO: check for unsynchronized notes

        var statusEl;
        if( !connected ) {
            statusEl = <span className="label label-danger">Disconnected</span>;
        } else if( syncing ) {
            statusEl = <span className="label label-primary">Syncing...</span>;
        } else {
            statusEl = <span className="label label-success">Connected</span>;
        }

        return (
          <nav className="navbar navbar-default navbar-static-top" role="navigation">
            <div className="container">
              <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed"
                        data-toggle="collapse" data-target="#navbar"
                        aria-expanded="false" aria-controls="navbar">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="">Keep</a>
              </div>
              <p className="navbar-text navbar-right">
                Status: {statusEl}
              </p>
            </div>
          </nav>
        );
    },
});

module.exports = StatusBar;
