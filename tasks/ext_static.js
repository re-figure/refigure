'use strict';

const gulp = require('gulp');
const extOpt = require('js.shared').config.get('extension');

module.exports = function () {

    gulp
        .src(extOpt.src + '/img/**/*')
        .pipe(gulp.dest(extOpt.dist + '/img'));

    return gulp.src(extOpt.src + '/css/**/*')
        .pipe(gulp.dest(extOpt.dist + '/css'));
};