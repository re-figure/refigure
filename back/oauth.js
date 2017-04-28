'use strict';

const constants = require('./const');
const httpStatus = require('http-status-codes');
const config = require('js.shared').config;
const db = require('./db');

const GoogleAuth = require('google-auth-library');

exports.google = oAuthGoogle;

function oAuthGoogle(req, res) {
    let CLIENT_ID = config.get('oauth.google.clientId');
    let gAuth = new GoogleAuth();
    let gClient = new gAuth.OAuth2(CLIENT_ID, '', '');

    if (!req.params.token) {
        res.status(httpStatus.BAD_REQUEST).json({
            error: constants.ERROR_BADPARAMETERS,
            message: constants.ERROR_MSG_BADPARAMETERS
        });
    }
    gClient.verifyIdToken(req.params.token, CLIENT_ID, (e, login) => {
        let payload = login.getPayload();
        console.log(payload);
        res.send(payload);
    });
}