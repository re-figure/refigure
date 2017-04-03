'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const ngHtml2Js = require('gulp-ng-html2js');
const uglify = require('gulp-uglify');
const classPrefix = require('gulp-class-prefix');

const extOpt = require('./../gulp.conf').extension;

module.exports = function () {

    let templates = gulp
        .src(extOpt.content.html)
        .pipe(rename({
            dirname: ''
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(ngHtml2Js({
            moduleName: 'ReFigureContent',
            prefix: 'view/'
        }))
        .pipe(concat('templates.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(extOpt.dist + '/content'));

    let scripts = gulp
        .src(extOpt.content.mainScripts)
        .pipe(concat('content.js'))
        .pipe(gulp.dest(extOpt.dist + '/content'));

    let styles = gulp
        .src(extOpt.content.css)
        .pipe(sass())
        .pipe(concat('content.css'))
        .pipe(classPrefix('rf-', {ignored: [/\.ng-/]}))
        .pipe(gulp.dest(extOpt.dist + '/content'));

    let parsers = gulp
        .src(extOpt.content.parsers)
        .pipe(gulp.dest(extOpt.dist + '/content/parsers'));

    return merge(templates, scripts, styles, parsers);
};
