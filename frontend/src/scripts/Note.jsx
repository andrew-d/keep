var React = require('react'),
    Morearty = require('morearty');


var Note = React.createClass({
    displayName: 'Note',
    mixins: [Morearty.Mixin],

    render: function() {
        var b = this.getDefaultBinding();

        var title = b.get('title'),
            itemHeader = null;

        if( title ) {
            itemHeader = (
                <div className="panel-heading">
                  <b>{title}</b>
                  <div className="pull-right">
                    <button type="button"
                            className="close"
                            aria-hidden="true"
                            onClick={this.handleClose}>&times;</button>
                  </div>
                </div>
            );
        }

        return (
            <div className="col-xs-4">
              <div className="panel panel-default">
                {itemHeader}
                <div className="panel-body">
                  {b.get('text')}
                </div>
              </div>
            </div>
        );
    },

    handleClose: function(e) {
        e.preventDefault();
        e.stopPropagation();

        // TODO
        console.log("Delete note");
    },
});

module.exports = Note;
