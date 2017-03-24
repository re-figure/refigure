'use strict';

const gulp = require('gulp');
const config = require('./../gulp.conf');

module.exports = function () {
    return gulp
        .src(config.indexSource)
        .pipe(gulp.dest(config.buildDir));
};
