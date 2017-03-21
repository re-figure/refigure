'use strict';

const gulp = require('gulp');
const embedlr = require('gulp-embedlr');
const livereload = require('gulp-livereload');

const config = require('./../gulp.conf');

module.exports = [['index'], function (cb) {
    return gulp
        .src(config.indexHtml)
        .pipe(embedlr({
            port: config.server.lrPort
        }))
        .pipe(gulp.dest(config.buildDir))
        .pipe(livereload({
            quiet: true
        }));
}];
