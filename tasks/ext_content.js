'use strict';

const gulp = require('gulp');
const config = require('js.shared').config;
const concat = require('gulp-concat');

const extOpt = config.get('extension');

module.exports = function () {

    gulp
        .src(extOpt.content.css)
        .pipe(concat('content.css'))
        .pipe(gulp.dest(extOpt.dist + '/content'));

    gulp
        .src(extOpt.content.parsers)
        .pipe(gulp.dest(extOpt.dist + '/content/parsers'));

    return gulp
        .src(extOpt.content.mainScripts)
        .pipe(concat('content.js'))
        .pipe(gulp.dest(extOpt.dist + '/content'));

};
