'use strict';

const gulp = require('gulp');
const livereload = require('gulp-livereload');

const config = require('./../gulp.conf');

module.exports = [[
    'build',
    'embedlr'
], function (cb) {
    livereload.listen(config.server.lrPort);
    let opts = {
        interval: 250
    };
    gulp.watch(config.htmSources, opts, ['htm']);
    gulp.watch(config.indexSource, opts, ['index', 'embedlr']);
    gulp.watch(config.imgSources, opts, ['img']);
    gulp.watch(config.jsSources, opts, ['js']);
    gulp.watch([config.clientDir + '/**/*.{sass,scss,css}'], opts, ['css']);
    gulp.watch('back/**/*.js', opts, ['server']);
}];
