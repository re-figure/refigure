'use strict';

const gulp = require('gulp');
const extOpt = require('js.shared').config.get('extension');
const replace = require('gulp-batch-replace');

module.exports = function () {
    let phs = [];

    Object.keys(extOpt.replace).forEach(function (ph) {
        phs.push([ph, extOpt.replace[ph]]);
    });

    return gulp
        .src(extOpt.manifest.json)
        .pipe(replace(phs))
        .pipe(gulp.dest(extOpt.dist));
};
