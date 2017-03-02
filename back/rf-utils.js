'use strict';

const vars = require('js.shared').vars;

const constants = require('./const.js');

exports.error = error;
exports.checkStringNotEmpty = checkStringNotEmpty;
exports.boolValue = boolValue;
exports.getUserName = getUserName;
exports.getObjectId = getObjectId;

/**
 * Check that given string is not empty
 * @param {string} s the string to check
 * @returns {boolean} true if the given string is define and is not null and has length
 */
function checkStringNotEmpty(s) {
    return (s && typeof s === 'string' && s.trim().length > 0);
}

/**
 * Send an error to the HTTP response
 * @param res   response
 * @param http  HTTP code (400, 401, 403, 409, 500, etc)
 * @param error extended code to be sent as {error:code}
 * @param message error message to be sent as {message:string}
 */
function error(res, http, error, message) {
    res
        .status(http)
        .send({
            error: error || http,
            message: message || constants.errorMessage(error)
        });
}

/**
 * Calculate boolean value
 * @param {string|number|boolean} s
 * @return {*}
 */
function boolValue(s) {
    if (s && typeof s === 'boolean') {
        return s;
    }
    if (s) {
        if (typeof s === 'number') {
            return s > 0;
        }
        if (typeof s === 'string') {
            return s.match(/true|yes|1|on/i);
        }
    }
    return false;
}


/**
 * Calculate full user name to be used in emails
 * @param {Object} user user info
 * @returns {string} - user name composed from first and last name or user's login
 */
function getUserName(user) {
    let name = user.Login;
    if (user.FirstName || user.LastName) {
        if (user.FirstName) {
            name = user.FirstName;
            if (user.LastName) {
                name += ' ' + user.LastName;
            }
        } else {
            name = user.LastName;
        }

    }
    return name;
}

/**
 * Extract object (User/Metapublication/Figure) ID from request
 * @param {Object} req
 * @param {Object} res
 * @returns {string} ID
 */
function getObjectId(req, res) {
    let id = vars.get(req, 'ID');
    if (!id) {
        throw {
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_BADPARAMETERS,
            message : 'No ID provided'
        };
    }
    return id;
}

