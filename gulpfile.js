const gulp = require('gulp');
const concat = require('gulp-concat');
const replace = require("gulp-replace")
const uglifyjs = require('uglify-es');
const composer = require('gulp-uglify/composer');
const sourcemaps = require("gulp-sourcemaps")
const fs = require("file-system")

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

gulp.task('version', function(){
    var docString = fs.readFileSync('./src/000_fforge_core.js', 'utf8');

    //The code below gets your semantic v# from docString
    var versionNumPattern=/VERSION:"[^ ]+ (.*)"/; //This is just a regEx with a capture group for version number
    var vNumRexEx = new RegExp(versionNumPattern);
    var oldVersionNumber = (vNumRexEx.exec(docString))[1]; //This gets the captured group

    //...Split the version number string into elements so you can bump the one you want
    var versionParts = oldVersionNumber.split('.');
    var vArray = {
        vMajor : versionParts[0],
        vMinor : versionParts[1],
        vPatch : versionParts[2]
    };

    vArray.vPatch = parseFloat(vArray.vPatch) + 1;
    var periodString = ".";

    var newVersionNumber = vArray.vMajor + periodString +
                           vArray.vMinor+ periodString +
                           vArray.vPatch;

    gulp.src(['./src/000_fforge_core.js'])
        .pipe(replace(/VERSION:"([^ ]+) (.*)"/g, `VERSION:"$1 ${newVersionNumber}"`))
        .pipe(gulp.dest('./src/'));
});

gulp.task('all', ['version', 'scripts', 'compendiums'])
gulp.task('build', ['scripts', 'compendiums'])