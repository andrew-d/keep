/** @jsx React.DOM */
var React = require('react');
var pkg = require('../package.json');
var $ = require('jquery');

React.renderComponent(<h3>{pkg.name}, brought to you by React!</h3>, document.querySelectorAll("#application")[0]);
