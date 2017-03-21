'use strict';

const gulp = require('gulp');
const extOpt = require('js.shared').config.get('extension');
const htmlmin = require('gulp-htmlmin');
const ngHtml2Js = require('gulp-ng-html2js');
const replace = require('gulp-batch-replace');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

module.exports = function () {

    gulp
        .src(extOpt.src + '/popup/**/!(*popup).html')
        .pipe(rename({
            dirname: ''
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(ngHtml2Js({
            moduleName: 'ReFigure',
            prefix: 'view/'
        }))
        .pipe(concat('templates.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(extOpt.dist + '/popup'));

    gulp.src(extOpt.popup.index)
        .pipe(gulp.dest(extOpt.dist + '/popup'));

    gulp.src(extOpt.popup.css)
        .pipe(gulp.dest(extOpt.dist + '/popup'));

    let phs = [];

    Object.keys(extOpt.replace).forEach(function (ph) {
        phs.push([ph, extOpt.replace[ph]]);
    });

    return gulp
        .src(extOpt.popup.js)
        .pipe(concat('app.js'))
        .pipe(replace(phs))
        .pipe(gulp.dest(extOpt.dist + '/popup'));
};
