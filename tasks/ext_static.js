'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;
const merge = require('merge-stream');

module.exports = function () {

    return merge(
        gulp
            .src(extOpt.src + '/img/**/*')
            .pipe(gulp.dest(extOpt.dist + '/img')),
        gulp
            .src(extOpt.src + '/vendor/bootstrap/fonts/bootstrap/*')
            .pipe(gulp.dest(extOpt.dist + '/fonts'))
    )

};
