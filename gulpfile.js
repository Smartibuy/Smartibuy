var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename  = require('gulp-rename');
var uglify = require('gulp-uglify');

var path = {
  js: ['./public/javascript/**/*.js', './public/javascript/*.js'],
};

/******
Watch Task
*******/
gulp.task('watch', function() {
  gulp.watch(path.js, ['build']);
});

/******
browserify, uglify, rename js file.
*******/
gulp.task('build', function() {
  gulp.src('./public/javascript/index.js')
  .pipe(browserify({
    insertGlobals: true,
  }))
  .pipe(rename('bundle.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./public/javascript'));
});

gulp.task('default', ['build', 'watch']);
