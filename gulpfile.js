(function () {
    'use strict';

    let gulp = require('gulp');
    //let runSequence = require('run-sequence');
    let config = require('js.shared').config;

    let p = require('./package.json');
    config.init(p.locals);

    require('gulp-load-tasks')();

    gulp.task('build', [
        'index'
    ]);

    gulp.task('default', [
        'build',
        'server'
    ]);
}());
