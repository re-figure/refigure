'use strict';

(function () {
    'use strict';

    let gulp = require('gulp');
    let runSequence = require('run-sequence');
    let config = require('js.shared').config;

    let p = require('./package.json');
    config.init(p.locals);

    require('gulp-load-tasks')();

    gulp.task('build', [
        'bower',
        'htm',
        'img',
        'js',
        'css',
        'index',
        'extension'
    ]);

    gulp.task('deploy', function (done) {
        runSequence(
            'clean',
            ['build', 'minify'],
            done
        );
    });

    gulp.task('default', [
        'build',
        'server',
        'watch'
    ]);

    gulp.task('extension', function (cb) {
        runSequence(
            ['ext_manifest', 'ext_background', 'ext_content', 'ext_popup', 'ext_static'],
            'ext_zip',
            cb
        );
    });

    /*gulp.task('ext_default', function (cb) {
        runSequence(
            'extension',
            'ext_watch',
            cb
        );
    });*/

}());
