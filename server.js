var express = require('express'),
    path    = require('path');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000)
    app.set('host', '0.0.0.0');

    app.use(express.logger());
    app.use('/', express.static(path.join(__dirname, 'build')));
});

app.listen(app.get('port'), app.get('host'), function() {
    // Mimic the Python 'SimpleHTTPServer' status line.
    console.log('Serving HTTP on ' + app.get('host') +
                ' port ' + app.get('port') + ' ...');
});
