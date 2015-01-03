var clean      = require('gulp-clean'),
    express    = require('express'),
    gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    minifyCSS  = require('gulp-minify-css'),
    path       = require('path'),
    prefix     = require('gulp-autoprefixer'),
    rev        = require('gulp-rev'),
    sass       = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    tiny_lr    = require('tiny-lr'),
    watch      = require('gulp-watch'),
    webpack    = require("webpack");


// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------
var httpPort = 4000;

var webpackConfig = require("./webpack.config.js");
if( gulp.env.production ) {  // i.e. we were executed with a --production option
    webpackConfig.plugins = webpackConfig.plugins.concat(
        new webpack.optimize.UglifyJsPlugin());
}

// Paths to files in bower_components that should be copied to dist/assets/vendor
var vendorPaths = [
    'bootstrap/dist/css/bootstrap.min.css',
    'font-awesome/css/font-awesome.min.css',
];

// Configuraton for SASS
var sassConfig = {
    includePaths: ['src/styles'],
}

// ----------------------------------------------------------------------
// TASKS
// ----------------------------------------------------------------------

gulp.task('clean', function() {
    gulp.src([
        'dist/**/*',
        '!dist/.gitignore',
    ], {read: false}).pipe(clean());
});

gulp.task('sass', function() {
    gulp.src('src/styles/main.scss')
        .pipe(sourcemaps.init())
          .pipe(sass(sassConfig).on('error', gutil.log))
          .pipe(prefix({
                // Note: these are the defaults, but I'm specifying them anyway.
                browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],
                cascade: true,
                remove: true,
           }))
          .pipe(gulp.env.production ? minifyCSS() : gutil.noop())
          .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets'))
});


// Copy over fonts that Bootstrap expects.
gulp.task('vendor_fonts', function() {
    var fontPaths = [
        'font-awesome/fonts/FontAwesome.otf',
        'font-awesome/fonts/fontawesome-webfont.eot',
        'font-awesome/fonts/fontawesome-webfont.svg',
        'font-awesome/fonts/fontawesome-webfont.ttf',
        'font-awesome/fonts/fontawesome-webfont.woff',
    ];
    var paths = fontPaths.map(function(p) {
        return path.resolve("./bower_components", p);
    });

    gulp.src(paths)
        .pipe(gulp.dest('dist/assets/fonts'));
});


// Some JS and CSS files we want to grab from Bower and put them in a
// dist/assets/vendor directory.
gulp.task('vendor', ['vendor_fonts'], function() {
    var paths = vendorPaths.map(function(p) {
        return path.resolve("./bower_components", p);
    });

    gulp.src(paths)
        .pipe(gulp.dest('dist/assets/vendor'));
});

// Just copy over remaining assets to dist. Exclude the styles and scripts as
// we process those elsewhere
gulp.task('copy', function() {
    gulp.src([
        'src/**/*',
        '!src/Bootstrap.jsx',
        '!src/scripts',
        '!src/scripts/**/*',
        '!src/styles',
        '!src/styles/**/*'
    ]).pipe(gulp.dest('dist'));
});

// This task lets Webpack take care of all the coffeescript and JSX
// transformations, defined in webpack.config.js.  Webpack also does its own
// uglification if we are in --production mode
gulp.task('webpack', function(callback) {
    execWebpack(webpackConfig);
    return callback()
});


gulp.task('watch', ['build'], function() {
    gulp.watch(['./src/**/*'], function(evt) {
        gulp.run('build');
    });
});


gulp.task('dev', ['build'], function() {
    servers = createServers(httpPort, 35729);

    // When /src changes, fire off a rebuild
    gulp.watch(['./src/**/*'], function(evt) {
        gulp.run('build');
    });

    // When /dist changes, tell the browser to reload
    gulp.watch(['./dist/**/*'], function(evt) {
        gutil.log(gutil.colors.cyan(evt.path), 'changed')
        servers.lr.changed({
            body: {
                files: [evt.path],
            },
        });
    });
});



gulp.task('build', ['webpack', 'sass', 'copy', 'vendor'], function() {});

gulp.task('default', ['build'], function() {
    // Give first-time users a little help
    setTimeout(function() {
        gutil.log("**********************************************");
        gutil.log("* gulp              (development build)");
        gutil.log("* gulp clean        (rm /dist)");
        gutil.log("* gulp --production (production build)");
        gutil.log("* gulp dev          (build and run dev server)");
        gutil.log("**********************************************");
    }, 3000);
});


// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------
// Create both http server and livereload server
var createServers = function(port, lrport) {
    lr = tiny_lr();
    lr.listen(lrport, function() {
        gutil.log("LiveReload listening on", lrport);
    });

    app = express();
    app.use(express.static(path.resolve("./dist")));
    app.listen(port, function() {
        gutil.log("HTTP server listening on", port);
    });

    return {
        lr: lr,
        app: app
    };
};


// Run webpack and handle errors.
var execWebpack = function(config) {
    webpack(config, function(err, stats) {
        if( err ) {
            throw new gutil.PluginError("execWebpack", err);
        }

        gutil.log("[execWebpack]", stats.toString({colors: true}))
    });
};
