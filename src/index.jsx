/** @jsx React.DOM */
var $        = require('jquery');
var Backbone = require('backbone');
var React    = require('react');
var pkg      = require('../package.json');

// Strip the JSON-hijacking prefix from all responses.
$.ajaxSetup({
    dataFilter: function(data, type) {
        if( type !== 'json' && type !== 'jsonp' ) {
            return data;
        }

        var prefix = 'while(1);';
        if( data.slice(0, prefix.length) === prefix ) {
            return data.substring(prefix.length);
        }

        return data;
    }
});

// TODO: find better way to deal with this
Backbone.$ = $;

var Application = require('./js/App.jsx')

// Just render the main application to the DOM.
React.renderComponent(
    Application({}),
    document.getElementById("application")
);
