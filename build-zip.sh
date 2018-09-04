rm -rf build_temp
node_modules/gulp/bin/gulp.js scripts
node_modules/gulp/bin/gulp.js compendiums
node_modules/gulp/bin/gulp.js pack
node_modules/gulp/bin/gulp.js zip
rm -rf build_temp
echo "Done!"
