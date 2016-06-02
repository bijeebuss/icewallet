var browserify = require('browserify');
var tsify = require('tsify');
var gulp = require('gulp');
var fs = require('fs');
var config = require('./tsconfig.json')

gulp.task('default', ['compileTypescript', 'watch']);

gulp.task('compileTypescript', function () {
    return browserify({ debug: true })
     .add('src/client.ts')
     .plugin(tsify, config.compilerOptions)
     .bundle()
     .on('error', function (error) { console.error(error.toString()); })
     .pipe(fs.createWriteStream(__dirname + '/app.js'));
});

gulp.task('browserify', function () {
    return browserify({ debug: true })
     .add('src/client.js')
     .bundle()
     .on('error', function (error) { console.error(error.toString()); })
     .pipe(fs.createWriteStream(__dirname + '/app.js'));
});

gulp.task("watch", function () {
    gulp.watch("**/*.ts", ["browserify"]);
});

//var watcher = gulp.watch('**/*.ts', ['compileTypescript']);
