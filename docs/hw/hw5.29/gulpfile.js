var gulp = require('gulp'),
watch = require('gulp-watch'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
cssvars = require('postcss-simple-vars'),
nested = require('postcss-nested'),
cssImport = require('postcss-import'),
browserSync = require('browser-sync').create(),
mixins = require('postcss-mixins');

gulp.task('watch', function(){
  browserSync.init({
    notify: false,
    server: {
      baseDir: "app"
    }
  });

  watch('./app/index.html', function(){
    // gulp.start('html');
    console.log('##########<HTML TASK...>##########');
    browserSync.reload();
  });

  watch('./app/assets/styles/**/*.css', function(){
    // gulp.start('styles');
    gulp.start('cssInject');
  });
});

gulp.task('styles', function(){
  console.log('##########<STYLES TASK...>##########');
  return gulp.src('./app/assets/styles/styles.css')
    .pipe(postcss([cssImport, mixins, cssvars, nested, autoprefixer]))
    .pipe(gulp.dest('./app/temp/styles'));
});

gulp.task('cssInject', ['styles'], function(){
  return gulp.src('./app/temp/styles/styles.css')
    .pipe(browserSync.stream());
});
