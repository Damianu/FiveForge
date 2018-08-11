const gulp = require('gulp');
const concat = require('gulp-concat');


var uglifyjs = require('uglify-es'); // can be a git checkout
                                     // or another module (such as `uglify-es` for ES6 support)
var composer = require('gulp-uglify/composer');
var minify = composer(uglifyjs, console);

gulp.task('compress', function() {
    return gulp.src(["src/*.js"])
        .pipe(minify({mangle:false}).on('error', function(e){
            console.log(e);
         }))
        .pipe(concat('FiveForge.js'))
        .pipe(gulp.dest('scripts'))
});