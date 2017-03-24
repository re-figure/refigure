'use strict';

const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const ngHtml2Js = require('gulp-ng-html2js');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');

const config = require('./../gulp.conf');

module.exports = [[], function (cb) {
    return gulp
        .src(config.htmSources)
        .pipe(rename({
            dirname: ''
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(ngHtml2Js({
            moduleName: 'refigureApp',
            prefix: 'view/'
        }))
        .pipe(concat(config.viewFileMin))
        .pipe(uglify())
        .pipe(gulp.dest(config.htmDir))
        .pipe(livereload());
}];
