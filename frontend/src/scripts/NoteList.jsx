var React = require('react'),
    Masonry = require('masonry'),
    Morearty = require('morearty'),
    $ = require('jquery'),
    throttle = require('lodash-node/modern/functions/throttle');

var Note = require('./Note');


var masonryOptions = {
    transitionDuration: 0,
};


var NoteList = React.createClass({
    displayName: 'NoteList',
    mixins: [Morearty.Mixin],

    masonry: null,

    render: function() {
        var b = this.getDefaultBinding(),
            notes = b.get();

        var renderNote = function(note, index) {
            var noteBinding = b.sub(index);

            return <Note key={index} binding={noteBinding} />;
        };

        return (
            <div className="note-list row" ref="masonryContainer">
              {notes.map(renderNote).toArray()}
            </div>
        );
    },

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

    // Use masonry to layout children
    layoutNodes: function() {
        // TODO: this isn't particularly efficient - we destroy and re-create
        // on every update.
        this.masonry = new Masonry(this.getDOMNode(), masonryOptions);
        this.masonry.layout();
    },

    componentWillUnmount: function() {
        this.unloadMasonry();

        $(window).off('resize', this.throttledLayout);
        this.throttledLayout = null;
    },

    componentWillUpdate: function() {
        this.unloadMasonry();
    },

    unloadMasonry: function() {
        if( !this.masonry ) return;

        this.masonry.destroy();
        this.masonry = null;
    },

    /*
    componentDidMount: function(rootNode) {
        // Whenever the window resizes, we need to re-layout the items.
        // TODO: consider using _.debounce or _.throttle to ensure this
        //       doesn't trigger too often.
        $(window).resize(this.handleResize);
    },

    componentDidUpdate: function(prevProps, prevState, rootNode) {
        this.handleResize();
    },

    handleResize: function() {
        // See: http://benholland.me/javascript/how-to-build-a-site-that-works-like-pinterest/
        var rootNode = this.getDOMNode();

        // We now layout the individual items with a pinterest-style layout.
        // Firstly, get the width of the container - i.e. the root node.
        var containerWidth = $(rootNode).width();
        var marginWidth = 15;

        // Get other parameters we need.
        // TODO: get this dynamically, since this won't work on the transition from
        // collapsed to not, due to the above .width() call not being applied yet!
        //var colWidth = $('.item').outerWidth();
        var colWidth = 200;

        if( containerWidth <= 460 ) {
            // If the total size of the container element is less than some
            // given breakpoint, we should just resize all the elements to the size
            // of the container (with margins) and not worry about this.
            var itemWidth = containerWidth - marginWidth*2;
            var totalHeight = marginWidth;

            $('.item').each(function() {
                var $this = $(this);
                $this.width(itemWidth);

                $this.css({
                    'top': totalHeight,
                    'left': marginWidth
                });

                var outerHeight = $this.outerHeight();
                totalHeight += outerHeight + marginWidth;
            });

            return;
        } else {
            // Resize the item to it's proper width.
            // NOTE: need to change this if we change the CSS!
            // TODO: find a way to get this from somewhere?
            $('.item').width(colWidth);
        }

        // Now, determine how many columns fit in the container.
        var columnCount = Math.floor(containerWidth / (colWidth + marginWidth*2));

        // We figure out how much space will be "unused" in the container node,
        // given these items, and add that as padding on the left side of the
        // elements that we add.  This stops us from having a really ugly empty
        // space on the far-right of the items list.
        var usedSpace = columnCount * (marginWidth + colWidth) + marginWidth;
        var unusedSpace = containerWidth - usedSpace;
        var leftOffset = unusedSpace / 2;

        // Save an array of blocks that store the height of each column.
        var blocks = [];
        for( var i = 0; i < columnCount; i++ ) {
            // Initial height of a stack is equal to the margin.
            blocks.push(marginWidth);
        }

        // Now, position each block.
        var items = document.querySelectorAll('.item');
        for( var i = 0; i < items.length; i++ ) {
            var item = items[i];

            // Find the minimum item in the blocks list and the index of it.
            // Note that we start the minimum value at the size of the window,
            // so any of the values in the block height are, by definition,
            // less.
            var minVal = $(window).height(), minIndex = 0;
            for( var j = 0; j < blocks.length; j++ ) {
                // Note: don't use '<=', since we want to ensure that items are
                // laid out from left-to-right.
                if( blocks[j] < minVal ) {
                    minVal = blocks[j];
                    minIndex = j;
                }
            }

            // Calculate the left position for this item - i.e. the position
            // that places it within the given column.
            var leftPos = leftOffset + marginWidth + minIndex * (colWidth + marginWidth);

            // The left position cannot be less than zero.
            if( leftPos < 0 ) {
                leftPos = 0;
            }

            // Set the position of the element.
            item.style.left = leftPos + 'px';
            item.style.top  = minVal + 'px';

            // Update the columns array with the new height of this column.
            blocks[minIndex] += $(item).outerHeight() + marginWidth;
        }
    }
    */
});

module.exports = NoteList;
