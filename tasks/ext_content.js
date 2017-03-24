'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const merge = require('merge-stream');

const extOpt = require('./../gulp.conf').extension;

module.exports = function () {

    return merge(gulp
            .src(extOpt.content.mainScripts)
            .pipe(concat('content.js'))
            .pipe(gulp.dest(extOpt.dist + '/content')),
        gulp
            .src(extOpt.content.css)
            .pipe(sass())
            .pipe(concat('content.css'))
            .pipe(gulp.dest(extOpt.dist + '/content')),
        gulp
            .src(extOpt.content.parsers)
            .pipe(gulp.dest(extOpt.dist + '/content/parsers'))
    )

};
