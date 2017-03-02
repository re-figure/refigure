const gulp = require('gulp');
const config = require('js.shared').config;

const buildDir = config.get('buildDir');
const indexSource = 'front/index.html';

module.exports = function () {
    return gulp
        .src(indexSource)
        .pipe(gulp.dest(buildDir));
};
