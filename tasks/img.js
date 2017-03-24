'use strict';

const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const livereload = require('gulp-livereload');

const config = require('./../gulp.conf');

module.exports = function () {
    return gulp.src(config.imgSources)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.imgDir))
        .pipe(livereload());
};
