const gulp = require('gulp');
const concat = require('gulp-concat');
const uglifyjs = require('uglify-es');
const composer = require('gulp-uglify/composer');
const sourcemaps = require("gulp-sourcemaps")
const minify = composer(uglifyjs, console);

gulp.task('scripts', function() {
    return gulp.src(["src/*.js", "!src/**/_*/"])
        .pipe(sourcemaps.init())
            .pipe(minify({mangle:false}).on('error', function(e){
                console.log(e);
            }))
            .pipe(concat('FiveForge.js'))
        .pipe(sourcemaps.write("../script_maps/"))
        .pipe(gulp.dest('scripts'))
});

gulp.task('compendiums', function() {
    return gulp.src(["src/_compendiums/*"])
        .pipe(concat('fforge_compendium_Player.js'))
        .pipe(gulp.dest('scripts/lazy/'))
});

gulp.task('all', ['scripts', 'compendiums'])