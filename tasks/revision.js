'use strict';

const gulp = require('gulp');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const clean = require('del');

const config = require('./../gulp.conf');
let revSources = [
    config.buildDir + '/**/' + config.cssFileMin,
    config.buildDir + '/**/' + config.jsFileMin,
    config.buildDir + '/**/' + config.cssLibFileMin,
    config.buildDir + '/**/' + config.jsLibFileMin,
    config.buildDir + '/**/' + config.viewFileMin
];
let manifestFile = config.tmpDir + '/rev-manifest.json';

module.exports = [[
    'index',
    'htm',
    'minify'
], function (cb) {
    gulp
        .src(revSources)
        .pipe(rev())
        .pipe(gulp.dest(config.buildDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.tmpDir))
        .on('finish', function () {
            let manifest = gulp.src(manifestFile);
            gulp
                .src(config.indexHtml)
                .pipe(revReplace({
                    manifest: manifest
                }))
                .pipe(gulp.dest(config.buildDir))
                .on('finish', function () {
                    clean.sync(revSources, {
                        force: false
                    });
                    cb();
                });
        });
}];
