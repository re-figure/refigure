'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;
const replace = require('gulp-batch-replace');
const concat = require('gulp-concat');
const merge = require('merge-stream');

module.exports = function () {


    return merge(
        gulp
            .src(extOpt.background.js)
            .pipe(concat('background.js'))
            .pipe(gulp.dest(extOpt.dist + extOpt.background.dir)),
        gulp.src(extOpt.background.html)
            .pipe(gulp.dest(extOpt.dist + extOpt.background.dir))
    )
};
