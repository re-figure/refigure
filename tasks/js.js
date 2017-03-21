'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const livereload = require('gulp-livereload');

const config = require('./../gulp.conf');

module.exports = [[], function () {
    return gulp
        .src(config.jsSources)
        .pipe(concat(config.jsFile))
        .pipe(gulp.dest(config.jsDir))
        .pipe(livereload());
}];
