'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');
const config = require('js.shared').config;

const buildDir = config.get('buildDir');
const extOpt = config.get('extension');

module.exports = function () {
    return gulp.src(extOpt.dist + '/**/*')
        .pipe(zip('refigure.zip'))
        .pipe(gulp.dest(buildDir))

};
