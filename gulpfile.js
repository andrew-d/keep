// Gulp + plugins
var gulp        = require('gulp'),
    browserify  = require('gulp-browserify'),
    closure     = require('gulp-closure-compiler'),
    concat      = require('gulp-concat'),
    filelog     = require('gulp-filelog'),
    gutil       = require('gulp-util'),
    refresh     = require('gulp-livereload'),
    rename      = require('gulp-rename'),
    replace     = require('gulp-replace'),
    uglify      = require('gulp-uglify');

var lr     = require('tiny-lr'),
    server = lr();


// Local package.json (for information);
var pkg         = require('./package.json');

var paths = {
    scripts: ['src/index.jsx', 'src/js/**/*.jsx', '!src/js/vendor/**'],
    statics: ['src/index.html']
    //images: 'client/img/**/*',
};

gulp.task('js', function() {
    // Browserify (with support for React.js), then rename to '.js',
    // then write out.
    return gulp.src(paths.scripts, {read: false})
        .pipe(browserify({
            // NOTE: We need the "browserify-shim" key to be present
            // in package.json so the "browserify-shim" transform
            // won't throw an error.
            transform: ['browserify-shim', 'reactify', 'envify'],

            // Shims for packages that don't support browserify.
            shim: {
                jquery: {
                    path: './src/js/vendor/jquery-1.11.0.js',
                    exports: '$',
                },
            },

            // Handle JSX files.
            extensions: ['jsx'],

            // Debug mode unless we're explicitly running in production.
            debug: gutil.env.NODE_ENV !== 'production',
        }))
        .pipe(concat(pkg.name + '.js'))
        .pipe(gulp.dest('build/js/'))
        .pipe(refresh(server));
});

gulp.task('statics', function() {
    // Simply replace the package name in any static files.
    return gulp.src(paths.statics)
        .pipe(replace("@@pkg_name", pkg.name))
        .pipe(gulp.dest('build/'))
        .pipe(refresh(server));
});

gulp.task('build', ['js', 'statics'], function() {
    // NOTE: call this with NODE_ENV=production to produce smaller
    // builds - 'envify', above, will strip out stuff that's not
    // necessary if that is true.
    if( gutil.env.NODE_ENV !== 'production' ) {
        gutil.log(gutil.colors.yellow("Building in non-production; " +
                                      "file will be non-optimal"));
    }

    return gulp.src('build/js/' + pkg.name + '.js')
        .pipe(closure())
        .pipe(concat(pkg.name + '.min.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(refresh(server));
});

gulp.task('lr-server', function() {
    // "lr" ==> 0x6c 0x72 ==> 29292
    server.listen(29292, function(err) {
        if(err) return console.log(err);
    });
})

// Rerun the task when a file changes
gulp.task('watch', ['js', 'statics', 'lr-server'], function() {
    gulp.watch(paths.scripts, ['js']);
    gulp.watch(paths.statics, ['statics']);
    //gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` by itself)
gulp.task('default', ['js', 'statics', 'lr-server']);
