/** @jsx React.DOM */
var React = require('react');
var _ = require('underscore')._;

var SyncStatus = require('./SyncStatus.jsx');

var Header = React.createClass({
    getInitialState: function() {
        return {active: null};
    },

    render: function() {
        // TODO: make this.props
        var navLinks = {
            'One': '/one',
            'Two': '/two',
        };

        var self = this;
        var linkNodes = _.map(navLinks, function(path, name) {
            var link = <a href={path}>{name}</a>

            if( self.state.active === name ) {
                return <li key={name} className="active">{link}</li>
            } else {
                return <li key={name}>{link}</li>
            }
        });

        // TODO: listen to router changes and update state.active
        // TODO: include JS for toggling navigation in vendor.js

        return (
            <div className="navbar navbar-default navbar-static-top" role="navigation">
              <div className="container-fluid">
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <a className="navbar-brand" href="#">Keep</a>
                </div>
                <div className="navbar-collapse collapse">
                  <ul className="nav navbar-nav">
                    {linkNodes}
                  </ul>
                  <div className="navbar-text navbar-right">
                    <SyncStatus />
                  </div>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = Header;
