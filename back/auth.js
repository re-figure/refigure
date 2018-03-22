'use strict';

const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');

const config = require('js.shared').config;
const utils = require('js.shared').utils; // jshint ignore:line

const constants = require('./const');
const db = require('./db');
const users = require('./users');
const rfUtils = require('./rf-utils');

exports.authFilter = authFilter;
exports.checkObjectAccess = checkObjectAccess;
exports.passwordValidate = passwordValidate;
exports.login = login;
exports.getUserId = getUserId;
exports.createToken = createToken;
exports.createTokenWithPassword = createTokenWithPassword;
exports.addAuthHeader = addAuthHeader;
exports.passwordCheckWeakness = passwordCheckWeakness;

let pathsNoAuth = [
    '/api/service-validate',
    '/api/check-figures',
    '/api/check-figures-v2',
    '/api/login',
    '/api/password-validate',
    '/api/captcha',
    '/api/captcha-validate',
    '/api/register',
    '/api/registration-complete',
    '/api/password-change-request',
    '/api/password-change',
    '/api/most-visited-metapublications',
    '/api/metapublications',
    '/api/downloads'
];

let pathsNoAuthGET = [
    '/api/figure',
    '/api/metapublication',
    '/api/oauth/google',
    '/api/oauth/fb',
    '/api/blog'
];

/**
 * Check if the given REST API request must be authenticated, i.e. contain security token
 * @param {Object} req input request
 * @returns {boolean} true if request must be authenticated
 */
function shouldAuthenticate(req) {

    let reqPath = req.path.toLowerCase();

    for (let path of pathsNoAuth) {
        if (reqPath.indexOf(path) === 0) {
            return false;
        }
    }

    if (req.method === 'GET') {
        for (let path of pathsNoAuthGET) {
            if (reqPath.indexOf(path) === 0) {
                return false;
            }
        }
    }
    return req.path.match(/\/api\//);
}

/**
 * Check if a request requires admin access
 * @param {Object} req input HTTP request
 * @returns {boolean} true if user must be an admin to get access to the resource
 */
function isAdminRequest(req) {
    if (req.path.match(/\/api\//)) {
        if (req.path.match(/user/i) && !req.path.match(/userinfo/)) {
            return true;
        }
        if (req.path.match(/statistics/i)) {
            return true;
        }
        if (req.method === 'GET' && req.path.match(/downloads/i)) {
            return true;
        }
    }
    return false;
}

/**
 * Extract current user ID from the security token provided in the request
 * @param {Object} req
 * @returns user's ID/null
 */
function getUserId(req) { // jshint ignore:line
    if (!config.get('jwt.useToken')) {
        return req.query.ID || req.body.ID;
    }
    let token = utils.get(req, 'body.token') ||
        utils.get(req, 'query.token') ||
        req.get(constants.AUTHENTICATION_HEADER) ||
        utils.get(req, ['cookies', constants.AUTHENTICATION_HEADER]);
    if (token) {
        try {
            let decoded = jwt.verify(token, config.get('jwt.key'));
            if (decoded && decoded.user) {
                return decoded.user;
            }
        } catch (err) {
            console.error('Failed to verify JWT', err);
        }
    }
    return null;
}

/**
 * Create a JWT token by putting user's ID there and signing by security key stored in package.json
 * @param {Object} user User info
 * @return {string} signed JWT token
 */
function createToken(user) {
    return jwt.sign({user: user.ID}, config.get('jwt.key'));
}

/**
 * Create token to be used in password reminder:
 * the token contains user's ID, user's old password hash, and expires in 10 hours
 * @param {Object} user User info
 * @return {string} signed JWT token
 */
function createTokenWithPassword(user) {
    return jwt.sign(
        {
            user: user.ID,
            reqid: user.Password
        },
        config.get('jwt.key'),
        {
            expiresIn: config.get('jwt.pwdChangeExpiresIn')
        }
    );
}

/**
 * Check if the request is issued by authenticated user, i.e. the request contains a valid JWT token
 * and user with the given ID is presented in the database
 * @param {Object} req
 * @param {Function} callback
 */
function authenticate(req, callback) {
    let userId = getUserId(req);
    if (userId) {
        db.cbFind(db.model.TABLE_USER, {[db.model.ID]: userId}, (err, results) => {
            if (err) {
                callback({
                    http: httpStatus.UNAUTHORIZED,
                    error: constants.ERROR_SQL,
                    message: constants.ERROR_MSG_SQL
                });
            } else {
                if (results.length > 0) {
                    let user = results[0];
                    if (user.Password) {
                        delete user.Password;
                    }
                    if (user.Type === constants.USER_TYPE_NOTCONFIRMED) {
                        // registration is not completed yet
                        callback({
                            http: httpStatus.UNAUTHORIZED,
                            error: constants.ERROR_USERNOTREGISTERED
                        });
                    } else {
                        user.Token = createToken(user);
                        callback({
                            data: user
                        });
                    }
                } else {
                    callback({
                        http: httpStatus.UNAUTHORIZED,
                        error: constants.ERROR_SQLNOTFOUND,
                        message: constants.ERROR_MSG_USERNOTFOUND
                    });
                }
            }
        });
    } else {
        callback({
            error: constants.ERROR_NOSECTOKEN,
            message: constants.ERROR_MSG_NOSECTOKEN
        });
    }
}

/**
 * Add authentication header with JWT token to the response headers
 * @param {Object} res HTTP response
 * @param {string} token the Auth token to be added to response headers
 */
function addAuthHeader(res, token) {
    res.set(constants.AUTHENTICATION_HEADER, token);
}

/**
 * Filter requests by validating authentication header
 * @param {Object} req input HTTP request
 * @param {Object} res output HTTP response
 * @param {Function} next next handler
 */
function authFilter(req, res, next) {
    if (shouldAuthenticate(req)) {
        authenticate(req,  (r) => {
            if (r.error) {
                rfUtils.error(res, r.http ? r.http : httpStatus.UNAUTHORIZED, r.error, r.message);
            } else {
                let user = r.data;
                if (isAdminRequest(req)) {
                    if (user.Type !== constants.USER_TYPE_ADMIN) {
                        rfUtils.error(
                            res,
                            httpStatus.FORBIDDEN,
                            constants.ERROR_FORBIDDEN,
                            constants.ERROR_MSG_FORBIDDEN
                        );
                        return;
                    }
                }
                addAuthHeader(res, user.Token);
                req.User = user;
                next();
            }
        });
    } else {
        // check if auth token is set for temporary user and parse it
        let userId = getUserId(req);
        if (userId) {
            db.cbFind(db.model.TABLE_USER, {[db.model.ID]: userId}, (err, results) => {
                if (!err && results.length > 0) {
                    req.User = results[0];
                }
                next();
            });
        } else {
            next();
        }
    }
}

/**
 * Perform login using provided login/email and password
 * @param {Object} req
 * @param {Object} res
 */
function login(req, res) {
    let user = req.body;
    if (user && user.Password && (user.Email || user.Login)) {
        users.loginUserWithPassword(user.Email, user.Password, (r) => {
            if (r.error) {
                rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_USERNOTFOUND);
            } else {
                let foundUser = r.data;
                if (foundUser.Type === constants.USER_TYPE_NOTCONFIRMED) {
                    // not an active user, registration has not been confirmed yet
                    rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_USERNOTREGISTERED);
                } else {
                    let token = createToken(foundUser);
                    delete foundUser.Password;
                    foundUser.Token = token;
                    addAuthHeader(res, token);
                    res.status(httpStatus.OK).send({error: 0, data: foundUser});
                }
            }
        });
    } else {
        rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_USERNOTFOUND);
    }

}

/**
 * Check password complexity
 * @param {string} p provided password
 * @returns {*}
 */
function passwordCheckWeakness(p) {
    if (config.getT('system.weak-password', 'b')) {
        return {
            error: 0
        };
    }
    if (rfUtils.checkStringNotEmpty(p)) {
        if (p.length < 8) {
            return {
                error: constants.ERROR_WEAKPASSWORD,
                message: 'Password must be at least 8 characters length'
            };
        } else if (p === p.toLowerCase()) {
            return {
                error: constants.ERROR_WEAKPASSWORD,
                message: 'Password must contain at least one uppercase character'
            };
        } else if (p === p.toUpperCase()) {
            return {
                error: constants.ERROR_WEAKPASSWORD,
                message: 'Password must contain at least one lowercase character'
            };
        } else {
            if (!p.match(/.*[\W\d]+.*/)) {
                return {
                    error: constants.ERROR_WEAKPASSWORD,
                    message: 'Password must contain at least one none-alphanumeric or digital character'
                };
            } else {
                return {
                    error: 0
                };
            }
        }
    } else {
        return {
            error: constants.ERROR_WEAKPASSWORD,
            message: 'Your password does not meet the minimum strength requirements. Please enter another one.'
        };
    }
}

/**
 * Validate password strength
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function passwordValidate(req, res) {
    let r = passwordCheckWeakness(req.body.Password || req.body.password);
    if (r.error) {
        res.status(httpStatus.BAD_REQUEST).json(r);
    } else {
        res.send({error: 0});
    }
}

/**
 * Check that the current user (taken from the request) has access
 * to the object owned by the `owner` (user's ID)
 * @param {Object} req   the current request
 * @param {String} owner user's ID who owns the object
 * @returns {boolean} true if user has access to the given object
 */
function checkObjectAccess(req, owner) {
    if (!req.User) {
        return false;
    }
    if (!req.User.ID) {
        return false;
    }
    if (req.User.ID === owner) {
        // allow access to the object's owner
        return true;
    }
    return req.User.Type === constants.USER_TYPE_ADMIN;
}
