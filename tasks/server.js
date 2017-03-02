let service = require('gulp-service');
let yargs = require('yargs');

let indexFile = 'back/index.js';

module.exports = function () {
    var env = Object.create(process.env);

    for (var key in yargs.argv) {
        env[key] = yargs.argv[key];
    }

    service.run(indexFile, {
        env: env
    });
};
