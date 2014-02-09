/** @jsx React.DOM */
var $        = require('jquery');
var Backbone = require('backbone');
var React    = require('react');
var pkg      = require('../package.json');

// TODO: find better way to deal with this
Backbone.$ = $;

var Application = require('./js/App.jsx')

// Just render the main application to the DOM.
React.renderComponent(
    Application({}),
    document.getElementById("application")
);
