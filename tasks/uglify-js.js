'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const ngAnnotate = require('gulp-ng-annotate');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('del');

const config = require('./../gulp.conf');
const jsSources = [
    config.jsDir + '/' + config.jsLibFile,
    config.jsDir + '/' + config.jsFile
];

module.exports = [[
    'bower',
    'js'
], function (cb) {
    return gulp
        .src(jsSources)
        .pipe(ngAnnotate())
        .pipe(uglify({
            compress: true,
            beautify: true,
            mangle: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.jsDir))
        .on('finish', function () {
            clean.sync(jsSources, {
                force: false
            });
        });
}];
