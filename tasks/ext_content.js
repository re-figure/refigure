'use strict';

const gulp = require('gulp');
const config = require('js.shared').config;
const concat = require('gulp-concat');

const extOpt = config.get('extension');

module.exports = function () {

    gulp
        .src(extOpt.src + '/content/content.css')
        .pipe(gulp.dest(extOpt.dist + '/content'));

    gulp
        .src(extOpt.src + '/content/parsers/*.js')
        .pipe(gulp.dest(extOpt.dist + '/content/parsers'));

    return gulp
        .src([
            extOpt.src + '/js/sizzle/sizzle.min.js',
            extOpt.src + '/js/const.js',
            extOpt.src + '/content/content.js',
        ])
        .pipe(concat('content.js'))
        .pipe(gulp.dest(extOpt.dist + '/content'));

};
