'use strict';

const service = require('gulp-service');
const yargs = require('yargs');

const indexFile = 'back/index.js';

module.exports = function () {
    let env = Object.create(process.env);

    for (var key in yargs.argv) {
        env[key] = yargs.argv[key];
    }

    service.run(indexFile, {
        env: env
    });
};
