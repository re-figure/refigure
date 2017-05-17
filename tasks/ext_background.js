'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;
const replace = require('gulp-batch-replace');
const concat = require('gulp-concat');
const merge = require('merge-stream');

module.exports = function () {
    let phs = [];

    Object.keys(extOpt.replace).forEach(function (ph) {
        if (typeof extOpt.replace[ph] === 'boolean') {
            phs.push(['\'' + ph + '\'', extOpt.replace[ph]]);
        } else {
            phs.push([ph, extOpt.replace[ph]]);
        }
    });
    return merge(
        gulp
            .src(extOpt.background.js)
            .pipe(concat('background.js'))
            .pipe(replace(phs))
            .pipe(gulp.dest(extOpt.dist + extOpt.background.dir)),
        gulp.src(extOpt.background.html)
            .pipe(gulp.dest(extOpt.dist + extOpt.background.dir))
    );
};
