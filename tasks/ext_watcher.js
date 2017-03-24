'use strict';

const gulp = require('gulp');
const extOpt = require('./../gulp.conf').extension;

module.exports = [['extension'], function () {
    let opts = {
        interval: 250
    };

    gulp.watch(extOpt.manifest.json, opts, ['ext_manifest', 'ext_zip']);
    gulp.watch(extOpt.background.js.concat(extOpt.background.html), opts, ['ext_background', 'ext_zip']);
    gulp.watch(extOpt.content.parsers, opts, ['ext_content', 'ext_zip']);
    gulp.watch(
        extOpt.content.css.concat(extOpt.content.mainScripts, extOpt.content.css),
        opts,
        ['ext_content', 'ext_zip']
    );
    gulp.watch(
        extOpt.popup.js.concat(extOpt.popup.html, extOpt.popup.css, extOpt.popup.index),
        opts,
        ['ext_popup', 'ext_zip']
    );
}];