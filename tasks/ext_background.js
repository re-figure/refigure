'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;
const replace = require('gulp-batch-replace');
const concat = require('gulp-concat');

module.exports = function () {
    gulp.src(extOpt.background.html)
        .pipe(gulp.dest(extOpt.dist + extOpt.background.dir));

    return gulp
        .src(extOpt.background.js)
        .pipe(concat('background.js'))
        .pipe(gulp.dest(extOpt.dist + extOpt.background.dir));

};
