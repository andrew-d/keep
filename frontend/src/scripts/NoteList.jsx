var React = require('react'),
    Masonry = require('masonry'),
    component = require('omniscient'),
    throttle = require('lodash-node/modern/functions/throttle'),
    $ = require('jquery');

var Note = require('./Note').jsx;


var masonryOptions = {};


var MasonryMixin = {
    // ----------------------------------------------------------------------
    // Masonry methods
    //
    layoutNodes: function() {
        // TODO: this isn't particularly efficient - we destroy and re-create
        // on every update.
        this.masonry = new Masonry(this.getDOMNode(), masonryOptions);
        this.masonry.layout();
    },

    unloadMasonry: function() {
        if( !this.masonry ) return;

        this.masonry.destroy();
        this.masonry = null;
    },

    // ----------------------------------------------------------------------
    // Lifecycle methods
    //
    componentDidUpdate: function() {
        this.layoutNodes();
    },

    componentDidMount: function() {
        this.layoutNodes();

        // We want to re-layout nodes whenever the window resizes.
        this.throttledLayout = throttle(this.layoutNodes, {
            leading: true,
            trailing: true,
        });
        $(window).on('resize', this.throttledLayout);
    },

    componentWillUnmount: function() {
        this.unloadMasonry();

        $(window).off('resize', this.throttledLayout);
        this.throttledLayout = null;
    },

    componentWillUpdate: function() {
        this.unloadMasonry();
    },
};


var NoteList = component('NoteList', MasonryMixin, function(props) {
    var renderNote = function(note, index) {
        var noteBinding = props.notes.cursor(index);
        return <Note key={index} note={noteBinding} />;
    };

    var noteItems = props.notes.map(renderNote).toArray();

    return (
        <div className="note-list row" ref="masonryContainer">
          {noteItems}
        </div>
    );
});


module.exports = NoteList;
