'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const clean = require('del');

const config = require('./../gulp.conf');
let cssSources = [
    config.cssDir + '/' + config.cssLibFile,
    config.cssDir + '/' + config.cssFile
];

module.exports = [[
    'bower',
    'css'
], function () {
    return gulp
        .src(cssSources)
        .pipe(cssnano({
            zindex: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.cssDir))
        .on('finish', function () {
            clean.sync(cssSources, {
                force: false
            });
        });
}];
