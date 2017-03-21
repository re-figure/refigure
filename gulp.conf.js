'use strict';

let argv = require('yargs').argv;

let stage = argv.stage || 'dev';
let region = argv.region || 'us-east-1';
let buildDir = 'build';
let clientDir = './front';
let tmpDir = 'tmp';
let bowerDir = './bower_components';
let angularMaterialDir = bowerDir + '/angular-material';
let restApiUri = argv.api || '/api';

module.exports = {
    stage: stage,
    profile: argv.profile || 'default',
    region: region,
    server: {
        lrPort: 35729
    },

    replace: [],

    buildDir: buildDir,
    clientDir: clientDir,
    tmpDir: tmpDir,
    bowerDir: bowerDir,

    sassInc: [
        bowerDir,
        angularMaterialDir
    ],

    jsDir: buildDir + '/js',
    jsSources: [
        clientDir + '/app/**/*.module.js',
        clientDir + '/app/**/*.routes.js',
        clientDir + '/app/**/*.js'
    ],
    jsFile: 'app.js',
    jsFileMin: 'app.min.js',
    jsLibFile: 'libs.js',
    jsLibFileMin: 'libs.min.js',

    cssDir: buildDir + '/css',
    cssSources: [
        clientDir + '/assets/sass/main.sass'
    ],
    cssFile: 'app.css',
    cssFileMin: 'app.min.css',
    cssLibFile: 'libs.css',
    cssLibFileMin: 'libs.min.css',

    imgSources: [
        clientDir + '/assets/img/**/*.{png,gif,jpg,svg,ico}'
    ],
    imgDir: buildDir + '/img',

    fontDir: buildDir + '/fonts',
    fontSources: [
        clientDir + '/assets/fonts/**/*.*'
    ],

    htmSources: [
        clientDir + '/app/**/*.html'
    ],
    htmDir: buildDir + '/view',
    viewFileMin: 'partials.min.js',
    indexSource: clientDir + '/index.html',
    indexHtml: buildDir + '/index.html'
};
