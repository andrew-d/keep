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

var _ = require('underscore')._;


// Local package.json (for information);
var pkg         = require('./package.json');

// Shims for packages that don't support browserify.
var shims = {
    jquery: {
        path: './src/js/vendor/jquery-1.11.0.js',
        exports: '$',
    },
    react_backbone: {
        path: './src/js/vendor/react.backbone-mod.js',
        depends: {
            react: 'react'
        },
        exports: null,
    }
};

// Vendor libraries (i.e. stuff that's browserified but not shimmed).
var vendorLibs = ['react', 'underscore', 'backbone'];

gulp.task('js', function() {
    // We exclude all the shim names and the vendor libraries.
    var externals = _.keys(shims).concat(vendorLibs);

    // Note: only pass the entrypoint here, not all files.
    return gulp.src('src/index.jsx', {read: false})
        .pipe(browserify({
            transform: ['reactify', 'envify'],

            // Handle JSX files.
            extensions: ['jsx'],

            // Debug mode unless we're explicitly running in production.
            debug: gutil.env.NODE_ENV !== 'production',

            // Make the vendor libs external.
            external: externals,
        }))
        .pipe(rename(pkg.name + '.js'))
        .pipe(gulp.dest('build/js/'))
        .pipe(refresh(server));
});

gulp.task('vendor', function() {
    return gulp.src(['vendor.js'], {read: false})
        .pipe(browserify({
            // NOTE: We need the "browserify-shim" key to be present
            // in package.json so the "browserify-shim" transform
            // here won't throw an error.
            transform: ['browserify-shim', 'envify'],

            // Include shims here to actually get the right code in place.
            shim: shims,

            // Debug mode unless we're explicitly running in production.
            debug: gutil.env.NODE_ENV !== 'production',
        }).on('prebundle', function(bundle) {
            // We require the various vendor libraries here, but NOT our shims.
            // For whatever reason, we can't pass these in the options object,
            // above, so we just manually call it all here!
            vendorLibs.forEach(function(lib) {
                bundle.require(lib);
            });
        }))
        .pipe(rename('vendor.js'))
        .pipe(gulp.dest('build/js/'))
        .pipe(refresh(server));
});

gulp.task('static_html', function() {
    // Simply replace the package name in any static files.
    return gulp.src(['src/index.html'])
        .pipe(replace("@@pkg_name", pkg.name))
        .pipe(gulp.dest('build/'))
        .pipe(refresh(server));
});

gulp.task('static_css', function() {
    // Copy vendor CSS
    return gulp.src(['src/css/vendor/*.css'])
        .pipe(gulp.dest('build/css/vendor/'));
});

gulp.task('statics', ['static_html', 'static_css'], function() {
});

gulp.task('minify_js', ['js'], function() {
    return gulp.src('build/js/' + pkg.name + '.js')
        .pipe(uglify())
        .pipe(concat(pkg.name + '.min.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(refresh(server));
});

gulp.task('minify_vendor', ['vendor'], function() {
    return gulp.src('build/js/vendor.js')
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(refresh(server));
});

gulp.task('build', ['minify_js', 'minify_vendor', 'statics'], function() {
    // NOTE: call this with NODE_ENV=production to produce smaller
    // builds - 'envify', above, will strip out stuff that's not
    // necessary if that is true.
    var e = gutil.env.NODE_ENV;
    if( e !== 'production' ) {
        gutil.log(gutil.colors.yellow("Built in non-production; " +
                                      "file will be non-optimal"));
        gutil.log("  Value of NODE_ENV: " + e);
    }
});

gulp.task('lr-server', function() {
    // "lr" ==> 0x6c 0x72 ==> 29292
    server.listen(29292, function(err) {
        if(err) return console.log(err);
    });
})

// Rerun the task when a file changes
gulp.task('watch', ['js', 'statics', 'lr-server'], function() {
    gulp.watch([
        'src/index.jsx', 'src/js/**/*.jsx',
        'src/js/**/*.js',
        '!src/js/vendor/**'
    ], ['js']);
    gulp.watch(['src/index.html'], ['statics']);
    gulp.watch(['src/js/vendor/*.js', 'src/js/vendor/**/*.js'], ['vendor']);
});

// The default task (called when you run `gulp` by itself)
gulp.task('default', ['js', 'vendor', 'statics']);
