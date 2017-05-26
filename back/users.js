'use strict';

const httpStatus = require('http-status-codes');
const uuid = require('node-uuid');

const config = require('js.shared').config;
const utils = require('js.shared').utils;

const constants = require('./const');
const auth = require('./auth');
const db = require('./db');
const rfUtils = require('./rf-utils');
const cookies = require('js.shared').cookies;
const captcha = require('./captcha');
const mail = require('./email');
const metapublications = require('./metapublications');

exports.loginUserWithPassword = loginUserWithPassword;
exports.userInfo = userInfo;
exports.register = register;
exports.registrationComplete = registrationComplete;
exports.passwordChangeRequest = passwordChangeRequest;
exports.passwordChange = passwordChange;
exports.updateProfile = updateProfile;
exports.loginWithSocialID = loginWithSocialID;
exports.addSocialUser = addSocialUser;
exports.establishSession = establishSession;

exports.searchUsers = searchUsers;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;

/**
 * Get the current user info
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function userInfo(req, res) {
    // assuming the request is authenticated and validated
    // then user info is attached to the request
    res
        .status(httpStatus.OK)
        .send({
            data: req.User
        });
}

/**
 * Login user: check that user with the given login/email and password exists in the database,
 * user's account is activated and registration is completed,
 * provided password match the stored one
 * @param {string} userLoginOrEmail login or email
 * @param {string} password password in plain text
 * @param {CommonCallback} callback ({error:code, message:string, data:{user})
 */
function loginUserWithPassword(userLoginOrEmail, password, callback) {
    let s = userLoginOrEmail.toLowerCase();
    db.pool.query('SELECT * FROM ?? WHERE cmpPwd(`Password`, ?) = 1 AND (`Login` = ? OR `Email` = ?)',
        [db.model.TABLE_USER, password, s, s],
        (err, rows) => {
            if (err) {
                console.error('Failed to find user by login or email with password', err);
                callback({error: constants.ERROR_SQL});
            } else {
                if (rows.length > 0) {
                    let matchLogin = false;
                    for (let i = 0; i < rows.length; ++i) {
                        let user = rows[i];
                        if (user.Login && user.Login.toLowerCase() === s) {
                            matchLogin = true;
                            callback({
                                data: user
                            });
                            break;
                        }
                    }
                    if (!matchLogin) {
                        callback({
                            data: rows[0]
                        });
                    }
                } else {
                    callback({error: constants.ERROR_SQLNOTFOUND});
                }
            }
        }
    );
}

/**
 * Create session and send user's info back
 * @param {Object} res HTTP response
 * @param {Object} user
 */
function establishSession(res, user) {
    if (user.Password) {
        delete user.Password;
    }
    user.Token = auth.createToken(user);
    auth.addAuthHeader(res, user.Token);
    res
        .status(httpStatus.OK)
        .send({
            error: 0,
            data: user
        });
}

/**
 * Extract password change security token from headers and validate it
 * @param {Object} req HTTP request
 * @returns {null/decoded token}
 */
function getPasswordChangeToken(req) {
    let token = utils.get(req, ['params', 'token']) ||
        utils.get(req, ['body', 'token']) ||
        utils.get(req, ['query', 'token']) ||
        utils.get(req, ['headers', constants.AUTHENTICATION_HEADER]);
    if (!token) {
        console.log('No password change security token provided');
        return null;
    }

    let jwt = require('jsonwebtoken');
    try {
        let decoded = jwt.verify(token, config.get('jwt.key'));
        if (decoded && decoded.user && decoded.reqid) {
            return decoded;
        }
    } catch (e) {
        console.error('Failed to parse and verify token', e);
    }
    return null;
}

/**
 * Check that the registration info provided by UI is valid:
 *  login and email fields are not empty
 *  password is not empty and is strong enough
 * @param {Object} user
 * @returns {*} standard error
 */
function checkRegistrationInfo(user) {
    if (!user) {
        throw {
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_BADPARAMETERS,
            message: constants.ERROR_MSG_BADPARAMETERS
        };
    }
    if (!utils.validEmail(user.Email)) {
        throw {
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_BADPARAMETERS,
            message: 'Email is missed'
        };
    }
    if (!user.Login) {
        user.Login = user.Email;
    }
}

/**
 * @name checkPassword
 * @param {string} password The password to check
 * @description
 * Check that provided password is valid
 */
function checkPassword(password) {
    if (!utils.isset(password) || !rfUtils.checkStringNotEmpty(password)) {
        throw {
            status: httpStatus.BAD_REQUEST,
            error: constants.ERROR_BADPARAMETERS,
            message: 'Password is missed'
        };
    }
    let r = auth.passwordCheckWeakness(password);
    if (r.error) {
        throw {
            status: httpStatus.BAD_REQUEST,
            error: r.error,
            message: r.message
        };
    }
}

/**
 * @name cbAddUser
 * @param   {Object}    user User info
 * @param   {Function}  cb   Callback function.
 * @description
 * Adds new user
 */
function cbAddUser(user, cb) {
    user.ID = uuid.v1();
    let type = constants.USER_TYPE_NOTCONFIRMED;
    if (typeof user.Type !== 'undefined' && typeof user.Type === 'number') {
        type = user.Type;
    }
    let registrationType = constants.USER_REGISTRATION_TYPE_PASSWORD;
    if (typeof user.RegistrationType !== 'undefined' && typeof user.RegistrationType === 'number') {
        registrationType = user.RegistrationType;
    }

    db.pool.query(
        `INSERT INTO User (
            ID,
            Email,
            Login,
            Password,
            RegistrationType,
            Type,
            FirstName,
            LastName,
            Phone,
            Organization,
            Department,
            SocialID
        )
           VALUES (?, ?, ?, encPwd(?), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user.ID,
            user.Email.toLowerCase(),
            user.Login.toLowerCase(),
            user.Password,
            registrationType,
            type,
            user.FirstName || null,
            user.LastName || null,
            user.Phone || null,
            user.Organization || null,
            user.Department || null,
            user.SocialID || null
        ],
        cb
    );
}

/**
 * @name register
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @description
 * Registers new user
 */
function register(req, res) {
    // check captcha first
    if (config.getT('captcha.enabled', 'b')) {
        captcha.check(req, res);
    }

    // reset captcha cookies
    cookies.clear(res, constants.CAPTCHA_COOKIE);

    let user = req.body;

    checkRegistrationInfo(user);
    checkPassword(user.Password);

    cbAddUser(user, (err) => {
        if (err) {
            console.error(err.code, err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                rfUtils.error(
                    res,
                    httpStatus.CONFLICT,
                    constants.ERROR_USERALREADYEXISTS,
                    constants.ERROR_MSG_USERALREADYEXISTS
                );
            } else {
                rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
            }
            return;
        }
        db.cbFind(db.model.TABLE_USER, {[db.model.ID]: user.ID}, (err, results) => {
            if (err) {
                console.error(err.code, err.message);
                rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                return;
            }
            if (results.length === 0) {
                console.log('Registered user is not found');
                rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                return;
            }
            let newUser = results[0];
            if (newUser.Password) {
                delete newUser.Password;
            }
            mail.sendRegistrationEmail(newUser, (r) => {
            });
            res
                .status(httpStatus.OK)
                .send({
                    data: newUser
                });
        });
    });
}

/**
 * @name registrationComplete
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @description
 * Complete registration process:
 * this method supposed to get called from the registration confirmation page
 * and request must have a security token containing user ID
 */
function registrationComplete(req, res) {
    let userId = auth.getUserId(req);
    if (!userId) {
        rfUtils.error(res, httpStatus.UNAUTHORIZED, constants.ERROR_NOREGISTRATIONTOKEN);
        return;
    }

    db.pool.query(
        `UPDATE User SET Type = 1 WHERE Type = 0 AND ID = ?`,
        [userId],
        (err, result) => {
            if (err) {
                console.error('Failed to complete registration', err);
                rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                return;
            }
            if (result.changedRows === 0) {
                rfUtils.error(
                    res,
                    httpStatus.BAD_REQUEST,
                    constants.ERROR_USERNOTFOUND,
                    'No registration found or registration has been already completed'
                );
                return;
            }

            db.cbFind(db.model.TABLE_USER, {[db.model.ID]: userId}, (err, results) => {
                if (err) {
                    console.error(err.code, err.message);
                    rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                    return;
                }
                if (results.length === 0) {
                    console.log('Registered user is not found');
                    rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                    return;
                }
                let user = results[0];
                establishSession(res, user);
            });

        });
}

/**
 * Request reset password:
 * an email with change password link will be sent to the user
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function passwordChangeRequest(req, res) {
    // check captcha first
    if (config.getT('captcha.enabled', 'b')) {
        captcha.check(req, res);
    }

    let email = req.body.Email;
    if (!email) {
        rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS);
        return;
    }
    db.cbFind(db.model.TABLE_USER, {['Email']: email}, (err, results) => {
        if (err) {
            console.error('passwordChangeRequest: cannot find user', err);
            rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
            return;
        }
        if (results.length === 0) {
            console.log('passwordChangeRequest: no users found');
            rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_USERNOTFOUND, constants.ERROR_MSG_USERNOTFOUND);
            return;
        }
        let user = results[0];
        mail.sendChangePasswordEmail(user, (r) => {
            if (r.error) {
                res
                    .status(r.http || httpStatus.INTERNAL_SERVER_ERROR)
                    .send(r);
                return;
            }
            res
                .status(httpStatus.OK)
                .send({
                    error: 0,
                    message: 'An email with reset password link has been sent to ' + email
                });
        });
    });
}

/**
 * Change user's password.
 * This request must follow a reset password request and
 * must have a security token generated by the reset password request
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function passwordChange(req, res) {
    if (req.method === 'GET') {
        checkPasswordToken(req, res);
    } else {
        updatePassword(req, res);
    }
}

/**
 * Validates change password token
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function checkPasswordToken(req, res) {
    // make sure the valid password change security token has been provided
    let decoded = getPasswordChangeToken(req);
    if (!decoded) {
        throw {
            status: httpStatus.UNAUTHORIZED,
            error: constants.ERROR_PASSWORDCHANGENOTPERMITTED,
            message: constants.ERROR_MSG_PASSWORDCHANGENOTPERMITTED
        };
    }
    res
        .status(httpStatus.OK)
        .send();
}

/**
 * @name updatePassword
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 * @description
 * Change user's password.
 * This request must follow a reset password request and
 * must have a security token generated by the reset password request
 */
function updatePassword(req, res) {
    let userId;

    // make sure the valid password change security token has been provided
    let decoded = getPasswordChangeToken(req);
    if (!decoded) {
        if (!req.User) {
            rfUtils.error(res, httpStatus.UNAUTHORIZED, constants.ERROR_PASSWORDCHANGENOTPERMITTED);
            return;
        }
        userId = req.User.ID;
    } else {
        userId = decoded.user;
    }

    // check that new password is provided and valid
    let password = utils.get(req.body, 'password');
    checkPassword(password);

    db.cbFind(db.model.TABLE_USER, {[db.model.ID]: userId}, (err, results) => {
        if (err) {
            console.error('passwordChange: cannot find user', err);
            rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
            return;
        }
        if (results.length === 0) {
            console.log('passwordChange: no user found');
            rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_USERNOTFOUND, constants.ERROR_MSG_USERNOTFOUND);
            return;
        }
        let user = results[0];
        if (decoded && user.Password !== decoded.reqid) {
            console.error('Password for user ' + decoded.user + ' has ben already changed');
            rfUtils.error(res, httpStatus.UNAUTHORIZED, constants.ERROR_PASSWORDCHANGENOTPERMITTED);
            return;
        }
        cbUpdateUser(
            {
                ID: user.ID,
                Password: password
            },
            (err) => {
                if (err) {
                    console.error('passwordChange: cannot update user', err);
                    rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                    return;
                }
                establishSession(res, user);
            });
    });
}

/**
 * @name cbUpdateUser
 * @param   {Object}    user User info
 * @param   {Function}  cb   Callback function.
 * @description
 * Updates user
 */
function cbUpdateUser(user, cb) { // jshint ignore:line
    let params = [];
    let q = 'UPDATE `User` SET';

    if (user.Login) {
        q += ' Login = ?';
        params.push(user.Login.toLowerCase());
    }

    if (user.Email) {
        if (params.length) {
            q += ', ';
        }
        q += ' Email = ?';
        params.push(user.Email.toLowerCase());
    }

    if (user.FirstName) {
        if (params.length) {
            q += ', ';
        }
        q += ' FirstName = ?';
        params.push(user.FirstName);
    }

    if (user.LastName) {
        if (params.length) {
            q += ', ';
        }
        q += ' LastName = ?';
        params.push(user.LastName);
    }

    if (user.Organization) {
        if (params.length) {
            q += ', ';
        }
        q += ' Organization = ?';
        params.push(user.Organization);
    }

    if (user.Department) {
        if (params.length) {
            q += ', ';
        }
        q += ' Department = ?';
        params.push(user.Department);
    }

    if (user.Phone) {
        if (params.length) {
            q += ', ';
        }
        q += ' Phone = ?';
        params.push(user.Phone);
    }

    if (user.Type) {
        // update user's type
        if (params.length) {
            q += ', ';
        }
        q += ' Type = ?';
        params.push(typeof user.Type === 'number' ? user.Type : constants.USER_TYPE_NOTCONFIRMED);
    }

    if (user.Password) {
        // update password
        if (params.length) {
            q += ', ';
        }
        q += ' Password = encPwd(?)';
        params.push(user.Password);
    }

    let userId = utils.get(user, 'ID');
    q += ' WHERE ID = ?';
    params.push(userId);

    db.pool.query(q, params, cb);
}

function updateProfile(req, res) {
    let user = {
        ID: req.User.ID
    };

    ['Login', 'Email', 'FirstName', 'LastName', 'Organization', 'Phone', 'Department'].filter((field) => {
        if (req.body[field]) {
            user[field] = req.body[field];
        }
        return true;
    });

    cbUpdateUser(user, (err) => {
        if (err) {
            console.error('updateUser: failed to update user', err);
            rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
            return;
        }
        db.cbFind(db.model.TABLE_USER, {[db.model.ID]: user.ID}, (err, results) => {
            if (err) {
                console.error('updateUser: cannot find user', err);
                rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                return;
            }
            if (results.length === 0) {
                console.log('updateUser: no user found');
                rfUtils.error(
                    res,
                    httpStatus.NOT_FOUND,
                    constants.ERROR_USERNOTFOUND,
                    constants.ERROR_MSG_USERNOTFOUND
                );
                return;
            }
            let updatedUser = results[0];
            establishSession(res, updatedUser);
        });
    });
}

function get(id, cb) {
    db.cbFind(db.model.TABLE_USER, {[db.model.ID]: id}, (err, results) => {
        if (err) {
            console.log(err);
            return cb({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        if (results.length === 0) {
            return cb({
                http: httpStatus.INTERNAL_NOT_FOUND,
                error: constants.ERROR_SQLNOTFOUND,
                message: 'No User found'
            });
        }

        let _u = metapublications.arrangeUserRecord(results[0]);
        cb({data: {User: _u}});
    });
}

/**
 * Get user info by its ID
 * @param {Object} req
 * @param {Object} res
 */
function getUser(req, res) {
    let _id = req.params.ID || req.query.ID || req.body.ID;
    get(_id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        res.send(r);
    });
}

function deleteUser(req, res) {
    let _id = req.params.ID || req.query.ID || req.body.ID;
    get(_id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        db.pool.query('DELETE FROM User WHERE ID = ?', [_id], (err) => {
            if (err) {
                console.log('Failed to delete User', err);
            }
            res.send(r);
        });
    });
}

function updateUser(req, res) {
    let _id = req.body.ID;
    get(_id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }

        let _user = {
            ID: _id
        };

        ['Login', 'Email', 'FirstName', 'LastName', 'Organization', 'Phone', 'Department', 'Type'].filter((field) => {
            if (req.body[field]) {
                _user[field] = req.body[field];
            }
            return true;
        });

        cbUpdateUser(_user, (err) => {
            if (err) {
                console.error('updateUser: failed to update user', err);
                rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
                return;
            }
            get(_id, (r) => {
                if (r.error) {
                    return rfUtils.error(res, r.http, r.error, r.message);
                }
                res.send(r);
            });
        });
    });
}

function searchUsers(req, res) {
    let r = rfUtils.parseQuery(undefined, req.query);
    if (r.error) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            constants.ERROR_MSG_BADPARAMETERS
        );
    }
    let query = r.data;

    let params = [];
    let q = `
        SELECT SQL_CALC_FOUND_ROWS *
          FROM User
    `;
    // TODO add search filter here
    if (query.sortField) {
        let valid = false;
        let sortVariant = [
            'Email', 'FirstName', 'LastName', 'Phone',
            'Organization', 'Department', 'DateCreated', 'DateModified', 'Type'
        ];
        for (let f of sortVariant) {
            valid = true;
            break;
        }
        if (!valid) {
            return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'Wrong sort provided');
        }
        q += ' ORDER BY ?? ' + query.sortDirection;
        params.push(query.sortField);
    } else {
        q += ' ORDER BY User.Email ASC';
    }
    q += ' LIMIT ' + query.from + ', ' + query.size;
    q += '; SELECT FOUND_ROWS() AS count;';
    db.pool.query({sql: q, nestTables: true}, params, (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
        }
        let recs = [];
        let found = 0;
        if (results[0].length > 0) {
            found = results[1][0][''].count;
            for (let r of results[0]) {
                let x = {
                    User: metapublications.arrangeUserRecord(r.User)
                };
                recs.push(x);
            }
        }

        res.send({
            data: {
                query: query,
                found: found,
                results: recs
            }
        });
    });
}

/**
 * @param {String} socialID
 * @param {Function} cb
 */
function loginWithSocialID(socialID, cb) {
    db.cbFind(db.model.TABLE_USER, {'SocialID': socialID}, (err, results) => {
        if (err) {
            console.log(err);
            cb({
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        if (!results || !results.length) {
            cb(false);
        } else {
            cb(results[0]);
        }
    });
}

function addSocialUser(user, cb) {
    checkRegistrationInfo(user);

    cbAddUser(user, (err) => {
        if (err) {
            console.error(err.code, err.message);
            let cbErr = {
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            };
            if (err.code === 'ER_DUP_ENTRY') {
                cbErr = {
                    error: constants.ERROR_USERALREADYEXISTS,
                    message: constants.ERROR_MSG_USERALREADYEXISTS
                };
            }
            return cb(cbErr);
        }
        db.cbFind(db.model.TABLE_USER, {[db.model.ID]: user.ID}, (err, results) => {
            if (err) {
                console.error(err.code, err.message);
                return cb({
                    error: constants.ERROR_SQL,
                    message: constants.ERROR_MSG_SQL
                });
            }
            if (results.length === 0) {
                console.log('Registered user is not found');
                return cb({
                    error: constants.ERROR_SQL,
                    message: constants.ERROR_MSG_SQL
                });
            }
            cb(results[0]);
        });
    });
}
