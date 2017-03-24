'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;

module.exports = function () {

    return gulp
        .src(extOpt.src + '/img/**/*')
        .pipe(gulp.dest(extOpt.dist + '/img'));

};