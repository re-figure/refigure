'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const server = require('./server');
const livereload = require('gulp-livereload');

const config = require('./../gulp.conf');

module.exports = function () {
    return gulp
        .src(config.cssSources)
        .pipe(sass({
            includePaths: config.sassInc
        }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(concat(config.cssFile))
        .pipe(gulp.dest(config.cssDir))
        .pipe(livereload());
};
