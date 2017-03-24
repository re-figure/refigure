'use strict';

const gulp = require('gulp');
const mainBowerFiles = require('gulp-main-bower-files');
const gulpFilter = require('gulp-filter');
const concat = require('gulp-concat');

const config = require('./../gulp.conf');

module.exports = function () {
    const jsFilter = gulpFilter(['**/*.js'], {
        restore: true
    });
    const cssFilter = gulpFilter('**/*.css', {
        restore: true
    });
    const imgFilter = gulpFilter('**/*.{png,gif,jpg,svg,ico}', {
        restore: true
    });

    return gulp.src('./bower.json')
        .pipe(mainBowerFiles(config.bowerConfig))
        // JS
        .pipe(jsFilter)
        .pipe(concat(config.jsLibFile))
        .pipe(gulp.dest(config.jsDir))
        .pipe(jsFilter.restore)
        // CSS
        .pipe(cssFilter)
        .pipe(concat(config.cssLibFile))
        .pipe(gulp.dest(config.cssDir))
        .pipe(cssFilter.restore)
        // Images
        .pipe(imgFilter)
        .pipe(gulp.dest(config.imgDir))
        .pipe(cssFilter.restore);
};
