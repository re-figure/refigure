let gulp = require('gulp');
let config = require('js.shared').config;

let buildDir = config.get('buildDir');
let indexSource = 'front/index.html';

module.exports = function () {
    return gulp
        .src(indexSource)
        .pipe(gulp.dest(buildDir));
};
