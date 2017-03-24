'use strict';

const clean = require('del');
const config = require('./../gulp.conf');

module.exports = function () {
    return clean.sync([config.buildDir, config.tmpDir], {
        force: false
    });
};
