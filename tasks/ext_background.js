'use strict';

const gulp = require('gulp');
const config = require('js.shared').config;
const replace = require('gulp-batch-replace');
const concat = require('gulp-concat');

const extOpt = config.get('extension');

module.exports = function () {
    gulp.src(extOpt.src + extOpt.background.dir + '/background.html')
        .pipe(gulp.dest(extOpt.dist + extOpt.background.dir));

    let phs = [];

    Object.keys(extOpt.replace).forEach(function (ph) {
        phs.push([ph, extOpt.replace[ph]]);
    });

    return gulp
        .src(extOpt.background.js)
        .pipe(concat('background.js'))
        .pipe(gulp.dest(extOpt.dist + extOpt.background.dir));

};
