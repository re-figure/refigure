'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');
const config = require('js.shared').config;

const buildDir = config.get('buildDir');
const conf = require('./../gulp.conf');

module.exports = function () {
    return gulp.src(conf.extension.dist + '/**/*')
        .pipe(zip('refigure.zip'))
        .pipe(gulp.dest(conf.buildDir))

};
