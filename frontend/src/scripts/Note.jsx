var React = require('react/addons'),
    component = require('omniscient')
    $ = require('jquery');


var HoverMixin = {
    getInitialState: function() {
        return {hover: false};
    },

    componentDidMount: function() {
        var $el = $(this.getDOMNode());

        $el.on('mouseenter', this.handleMouseEnter);
        $el.on('mouseleave', this.handleMouseLeave);
    },

    componentWillUnmount: function() {
        var $el = $(this.getDOMNode());

        $el.off('mouseenter', this.handleMouseEnter);
        $el.off('mouseleave', this.handleMouseLeave);
    },

    handleMouseEnter: function(e) {
        this.setState({hover: true});
    },

    handleMouseLeave: function(e) {
        this.setState({hover: false});
    },
};


var Note = component('Note', HoverMixin, function(props) {
    var note = props.note.deref(),
        title = note.get('title'),
        hover = this.state.hover,
        itemHeader = null;

    if( title ) {
        itemHeader = (
            <div className="panel-heading">
              <b>{title}</b>
            </div>
        );
    }

    var footerClasses = React.addons.classSet({
        'panel-footer': true,
        'invisible':    !hover,
        // TODO: fade in/out?
    });

    var handleDelete = () => {
        console.log("Should delete note:", note.toJS());
    };

    var handleEdit = () => {
        console.log("Should edit note:", note.toJS());
    };

    return (
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="panel panel-default">
            {itemHeader}
            <div className="panel-body">
              {note.get('text')}
            </div>
            <div className={footerClasses}>
              <div className="btn-group">
                <a className="btn btn-default" onClick={handleDelete}>
                  <i className="fa fa-lg fa-trash"></i>
                </a>
                <a className="btn btn-default" onClick={handleEdit}>
                  <i className="fa fa-lg fa-edit"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
    );
});


module.exports = Note;
