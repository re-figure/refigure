'use strict';

/**
 * Log an error and construct an appropriate HTTP response
 * @param {Object} err an error object
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 * @param {Object} next next handler in chain
 */
function logError(err, req, res, next) {
    console.error({
        route: req.route,
        err: err
    });
    
    req.unhandledError = err;

    let _message = err.message;
    let _error = err.error || err;
    let _status = err.status || err.http || 500;

    // abort request and return bad status
    res
        .status(_status)
        .json({
            error: _error,
            message: _message
        });
}

module.exports = logError;