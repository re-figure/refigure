'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');

const extOpt = require('./../gulp.conf').extension;

module.exports = function () {

    gulp
        .src(extOpt.content.css)
        .pipe(gulp.dest(extOpt.dist + '/content'));

    gulp
        .src(extOpt.content.parsers)
        .pipe(gulp.dest(extOpt.dist + '/content/parsers'));

    return gulp
        .src(extOpt.content.mainScripts)
        .pipe(concat('content.js'))
        .pipe(gulp.dest(extOpt.dist + '/content'));

};
