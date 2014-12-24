var React = require('react'),
    Router = require('react-router'),
    Morearty = require('morearty');


var StatusBar = React.createClass({
    displayName: 'StatusBar',
    mixins: [Morearty.Mixin, Router.Navigation],

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
                <a className="navbar-brand" href="">Keep</a>
              </div>

              <form className="navbar-form navbar-left" role="search">
                <div className="form-group">
                  <input type="text" className="form-control" ref="searchText" placeholder="Search" />
                </div>
                <button type="submit" className="btn btn-default" onClick={this.handleSearch}>Search</button>
              </form>

              <p className="navbar-text navbar-right">
                Status: {statusEl}
              </p>
            </div>
          </nav>
        );
    },

    handleSearch: function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Would search for:", this.refs.searchText.getDOMNode().value);
    },
});

module.exports = StatusBar;
