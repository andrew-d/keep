/** @jsx React.DOM */
var $ = require('jquery');
var React = require('react');
var _ = require('react_backbone');
var _ = require('underscore')._;

var Item = require('./Item.jsx');


var ItemList = React.createBackboneClass({
    render: function() {
        var itemNodes = this.getModel().map(function(item) {
            return (
                <div className="item">
                    <Item
                        key={item.id}
                        model={item} />
                </div>
            );
        });
        return (
            <div className="item-list row">
                {itemNodes}
            </div>
        );
    },

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

        // At the point where two columns can't be laid out anymore, we collapse.
        // This is where the following doesn't have the correct space:
        //  |margin|<--item-->|margin|<--item-->|margin|
        var breakpoint = (colWidth * 2) + (marginWidth * 3);

        if( containerWidth <= breakpoint ) {
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
        // Assuming zero padding, this looks like this:
        //
        //     +--------------------------------------------------+
        //     |margin|    item    |margin|    item    |...|margin|
        //     +--------------------------------------------------+
        //
        // Thus, we subtract the initial margin, and then divide by
        // (item+margin) to determine the number of columns.
        var columnCount = Math.floor((containerWidth - marginWidth) / (colWidth + marginWidth));

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
});


module.exports = ItemList;
