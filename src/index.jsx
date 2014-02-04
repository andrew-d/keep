/** @jsx React.DOM */
var React = require('react');
var pkg = require('../package.json');

var Application = require('./js/app.jsx')

// Just render the main application to the DOM.
React.renderComponent(
    Application({}),
    document.getElementById("application")
);
