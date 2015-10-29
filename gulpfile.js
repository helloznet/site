// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var htmlmin = require('gulp-html-minifier');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var sh = require('execSync');


// Lint Task
gulp.task('lint', function() {
    return gulp.src('javascript/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('frontPage', function() {
    return gulp.src(['javascript/resource/modernizr.min.js',
                     'javascript/resource/jquery.min.js',
                     'javascript/resource/fastclick.min.js',
                     'javascript/znetGeneric.js',
                     'javascript/znetNavMenu.js',
                     'javascript/znetTitleFill.js',
                     'javascript/znetPrecacheImages.js',
                     'javascript/znetAjaxLoadImages.js'])
        .pipe(concat('frontPage.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('javascript'));
});

gulp.task('story', function() {
    return gulp.src(['javascript/resource/modernizr.min.js',
                     'javascript/resource/jquery.min.js',
                     'javascript/resource/fastclick.min.js',
                     'javascript/znetGeneric.js',
                     'javascript/znetNavMenu.js',
                     'javascript/znetFullScreenImage.js',
                     'javascript/znetFirstPage.js',
                     'javascript/znetFootnotes.js',
                     'javascript/znetTitleFill.js',
                     'javascript/znetAjaxLoadImages.js'])
        .pipe(concat('story.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('javascript'));
});

gulp.task('layoutBlog', function() {
    return gulp.src(['javascript/resource/modernizr.min.js',
                     'javascript/resource/jquery.min.js',
                     'javascript/resource/fastclick.min.js',
                     'javascript/znetGeneric.js',
                     'javascript/znetNavMenu.js',
                     'javascript/znetFootnotes.js'])
        .pipe(concat('blog-index.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('javascript'));
});

gulp.task('static-page', function() {
    return gulp.src(['javascript/resource/modernizr.min.js',
                     'javascript/resource/jquery.min.js',
                     'javascript/znetGeneric.js',
                     'javascript/znetNavMenu.js'])
        .pipe(concat('static-page.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('javascript'));
});

gulp.task('search', function() {
    return gulp.src(['javascript/resource/modernizr.min.js',
                     'javascript/resource/jquery.min.js',
                     'javascript/znetNavMenu.js',
                     'javascript/znetTapirSearch.js'])
        .pipe(concat('search.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('javascript'));
});

gulp.task('jekyll', function () {
    var code = sh.run('jekyll b');
    console.log('return code ' + code);
});


gulp.task('minify-css', function() {
  return gulp.src('_site/css/**/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('_site/css'));
});

 
gulp.task('minify-html', function() {
  gulp.src('_site/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('_site/'))
});

gulp.task('amazon-s3', function () {
    var code = sh.run('s3_website push');
    console.log('return code ' + code);
});

gulp.task('kill', function () {
    var code = sh.run('ps aux | grep jekyll');
    console.log('return code ' + code);
});


gulp.task('build', ['frontPage', 'story', 'layoutBlog', 'static-page', 'search', 'jekyll', 'minify-css', 'minify-html']);
gulp.task('push', ['amazon-s3']);
