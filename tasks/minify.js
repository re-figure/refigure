'use strict';

const gulp = require('gulp');
const replace = require('gulp-batch-replace');

const config = require('./../gulp.conf');

module.exports = [[
    'index',
    'uglify-js',
    'minify-css'
], function () {
    return gulp
        .src(config.indexHtml)
        .pipe(replace([
            [config.jsFile, config.jsFileMin],
            [config.cssFile, config.cssFileMin],
            [config.jsLibFile, config.jsLibFileMin],
            [config.cssLibFile, config.cssLibFileMin]
        ]))
        .pipe(gulp.dest(config.buildDir));
}];
