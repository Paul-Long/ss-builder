const gulp = require('gulp');
const babel = require('gulp-babel');
const shell = require('shelljs');

gulp.task('build:js', function() {
  return gulp
    .src(['src/index.js', 'src/webpack/*.js', 'bin/*.js', 'scripts/*.js'], {base: '.'})
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: false,
              regenerator: true
            }
          ]
        ]
      })
    )
    .pipe(gulp.dest('lib'));
});
gulp.task('copy:pr', function() {
  return gulp.src(['./package.json', './README.md', './LICENSE']).pipe(gulp.dest('lib/'));
});
gulp.task('copy:static', function() {
  return gulp.src(['./src/webpack/favicon.ico', './src/webpack/index.html']).pipe(gulp.dest('lib/src/webpack/'));
});
gulp.task('build', function() {
  shell.exec('gulp build:js');
  shell.exec('gulp copy:pr');
  shell.exec('gulp copy:static');
});
