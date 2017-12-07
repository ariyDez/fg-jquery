//
// var gulp       = require('gulp'),
//     source     = require('vinyl-source-stream'),
//     rename     = require('gulp-rename'),
//     browserify = require('browserify'),
//     babelify   = require('babelify'),
//     glob       = require('glob'),
//     es         = require('event-stream');
//
// gulp.task('default', function(done) {
//     glob('./sources/js/*.js', function(err, files) {
//         if(err) done(err);
//
//         var tasks = files.map(function(entry) {
//             return browserify({ entries: [entry] })
//                 .transform(babelify.configure({ presets: ["es2015"] }))
//                 .bundle()
//                 .pipe(source(entry))
//                 .pipe(rename({
//                     extname: '.bundle.js'
//                 }))
//                 .pipe(gulp.dest('./public/js'));
//         });
//         es.merge(tasks).on('end', done);
//     })
// });
//
// gulp.task('styles', function() {
//     return gulp.src('sources/styles/*.styl')
//         .pipe(stylus())
//         .pipe(gulp.dest('public/styles/'));
// });

var gulp = require('gulp');
var babel = require('gulp-babel');
var browserify = require('browserify');
var babelify   = require('babelify');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var buffer = require('gulp-buffer');
var sourcemaps = require('gulp-sourcemaps');
var source     = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

gulp.task('js', function () {

    return gulp.src('sources/js/*.js', {read: false}) // no need of reading file because browserify does.

    // transform file objects using gulp-tap plugin
        .pipe(tap(function (file) {

            gutil.log('bundling ' + file.path);

            // replace file contents with browserify's bundle stream
            file.contents = browserify(file.path, {debug: true}).transform(babelify.configure({ presets: ["es2015"] })).bundle();

        }))

        // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
        .pipe(buffer())

        // load and init sourcemaps
        .pipe(sourcemaps.init({loadMaps: true}))

        .pipe(uglify())

        // write sourcemaps
        .pipe(sourcemaps.write('./'))

        .pipe(gulp.dest('public/js/'));
});

gulp.task('compile', function() {
    gulp.src('./sources/js/fg.jquery.min.js')
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'))
});

