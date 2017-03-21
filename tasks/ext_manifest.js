'use strict';

const gulp = require('gulp');
const config = require('js.shared').config;
const replace = require('gulp-batch-replace');

const extOpt = config.get('extension');

module.exports = function () {

    gulp
        .src(extOpt.src + '/img/**/*')
        .pipe(gulp.dest(extOpt.dist + '/img'));

    let phs = [];

    Object.keys(extOpt.replace).forEach(function (ph) {
        phs.push([ph, extOpt.replace[ph]]);
    });

    return gulp
        .src(extOpt.src + '/manifest.json')
        .pipe(replace(phs))
        .pipe(gulp.dest(extOpt.dist));
};
