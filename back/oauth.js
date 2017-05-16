'use strict';

const constants = require('./const');
const httpStatus = require('http-status-codes');
const config = require('js.shared').config;
const db = require('./db');
const users = require('./users');
const rfUtils = require('./rf-utils');

const GoogleAuth = require('google-auth-library');
const graph = require('fbgraph');

exports.google = Google;
exports.fb = FB;

function Google(req, res) {
    let CLIENT_ID = config.get('oauth.google.clientId');
    let gAuth = new GoogleAuth();
    let gClient = new gAuth.OAuth2(CLIENT_ID, '', '');

    if (!req.params.token) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            constants.ERROR_MSG_BADPARAMETERS
        );
    }
    gClient.verifyIdToken(req.params.token, CLIENT_ID, (err, login) => {
        if (err) {
            return rfUtils.error(
                res,
                httpStatus.UNAUTHORIZED,
                constants.ERROR_SOCIAL_REJECT,
                err.message
            );
        }
        let payload = login.getPayload();
        let userInfo = {
            SocialID: payload['sub'],
            FirstName: payload['given_name'],
            LastName: payload['family_name'],
            Email: payload['email'],
            Type: constants.USER_TYPE_CUSTOMER,
            RegistrationType: constants.USER_REGISTRATION_TYPE_GOOGLE,
            Password: null
        };
        users.loginWithSocialID(userInfo.SocialID, (r) => {
            if (r.error) {
                return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, r.error, r.message);
            }
            if (r === false) {
                users.addSocialUser(userInfo, (r) => {
                    if (r.error) {
                        return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, r.error, r.message);
                    }
                    users.establishSession(res, r);
                });
            } else {
                users.establishSession(res, r);
            }
        });
    });
}

function FB(req, res) {
    let CLIENT_SECRET = config.get('oauth.facebook.clientSecret');
    let fields = ['first_name', 'last_name', 'email'];

    if (!req.params.token) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            constants.ERROR_MSG_BADPARAMETERS
        );
    }
    graph.setAccessToken(req.params.token);
    graph.setAppSecret(CLIENT_SECRET);
    graph.get('/me', {fields:  fields.join(',')}, (err, resp) => {
        if (err) {
            return rfUtils.error(
                res,
                httpStatus.UNAUTHORIZED,
                constants.ERROR_SOCIAL_REJECT,
                err.message
            );
        }
        let userInfo = {
            SocialID: resp['id'],
            FirstName: resp['first_name'],
            LastName: resp['last_name'],
            Email: resp['email'],
            Type: constants.USER_TYPE_CUSTOMER,
            RegistrationType: constants.USER_REGISTRATION_TYPE_FACEBOOK,
            Password: null
        };
        users.loginWithSocialID(userInfo.SocialID, (r) => {
            if (r.error) {
                return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, r.error, r.message);
            }
            if (r === false) {
                users.addSocialUser(userInfo, (r) => {
                    if (r.error) {
                        return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, r.error, r.message);
                    }
                    users.establishSession(res, r);
                });
            } else {
                users.establishSession(res, r);
            }
        });
    });
}
