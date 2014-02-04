// Gulp + plugins
var gulp        = require('gulp'),
    browserify  = require('gulp-browserify'),
    closure     = require('gulp-closure-compiler'),
    concat      = require('gulp-concat'),
    filelog     = require('gulp-filelog'),
    rename      = require('gulp-rename'),
    replace     = require('gulp-replace'),
    uglify      = require('gulp-uglify'),
    util        = require('gulp-util');

// Local package.json (for information);
var pkg         = require('./package.json');

var paths = {
    scripts: ['src/index.jsx', 'src/js/**/*.jsx', '!src/js/vendor/**'],
    statics: ['src/index.html']
    //images: 'client/img/**/*',
};

gulp.task('js', function() {
    // Browserify (with support for React.js), then rename to '.js',
    // then minify, then write out.
    return gulp.src(paths.scripts, {read: false})
        .pipe(browserify({
            // Note: we've set the "transforms" property and some
            // shims in package.json.

            // Handle JSX files.
            extensions: ['jsx'],
            debug: !util.env.production,

            // Tell browserify to treat vendor libraries as
            // 'external'.
            external: ['jquery', 'react'],
        }))
        //.pipe(filelog())
        //.pipe(uglify())
        //.pipe(closure())
        .pipe(rename({
            ext: '.js',
        }))
        .pipe(gulp.dest('build/js/'));
});

gulp.task('vendor', function() {

});

gulp.task('statics', function() {
    // Simply rename the package name in any static files.
    return gulp.src(paths.statics)
        .pipe(replace("@@pkg_name", pkg.name))
        .pipe(gulp.dest('build/'));
});

gulp.task('build', ['js', 'vendor', 'statics'], function() {
    return gulp.src(
});

// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['js']);
  gulp.watch(paths.statics, ['statics']);
  //gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` by itself)
gulp.task('default', ['js', 'statics', 'watch']);
