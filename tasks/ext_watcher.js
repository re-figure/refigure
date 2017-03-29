'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;
const runSequence = require('run-sequence');

module.exports = [['extension'], () => {
    let opts = {
        interval: 250
    };

    gulp.watch(extOpt.manifest.json, opts, () => {
        runSequence('ext_manifest', 'ext_zip');
    });
    gulp.watch(extOpt.background.js.concat(extOpt.background.html), opts, () => {
        runSequence('ext_background', 'ext_zip');
    });
    gulp.watch(
        extOpt.content.mainScripts.concat(
            extOpt.common.css,
            extOpt.content.css,
            extOpt.content.parsers,
            extOpt.content.html
        ),
        opts,
        () => {
            runSequence('ext_content','ext_zip');
        }
    );
    gulp.watch(
        extOpt.popup.js.concat(extOpt.popup.html, extOpt.common.css, extOpt.popup.css, extOpt.popup.index),
        opts,
        () => {
            runSequence('ext_popup', 'ext_zip');
        }
    );
}];