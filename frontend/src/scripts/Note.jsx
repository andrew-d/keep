var React = require('react'),
    component = require('omniscient');


var Note = component('Note', function(props) {
    var note = prop.note.deref(),
        title = note.get('title'),
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
        'invisible':    !this.state.hover,
        // TODO: fade in/out?
    });

    var handleMouseEnter = () => {
        this.setState({hover: true});
    };

    var handleMouseExit = () => {
        this.setState({hover: false});
    };

    var handleDelete = () => {
        console.log("Should delete note:", note.toJS());
    };

    var handleEdit = () => {
        console.log("Should edit note:", note.toJS());
    };

    return (
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="panel panel-default"
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}>
            {itemHeader}
            <div className="panel-body">
                TODO: note body goes here
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
