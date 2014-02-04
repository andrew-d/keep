/** @jsx React.DOM */
var React = require('react');
//var pkg = require('../package.json');
var pkg = {name: 'keep'};
var $ = require('jquery');

React.renderComponent(<h1>{pkg.name}, brought to you by React!</h1>, document.querySelectorAll("#application")[0]);
