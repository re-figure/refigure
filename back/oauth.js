'use strict';


const constants = require('./const');
const httpStatus = require('http-status-codes');

//google
const GOOGLE_CLIENT_ID = '604123564572-uuu98pul48vj6t2uqgu2epi8723egmli.apps.googleusercontent.com';
const GoogleAuth = require('google-auth-library');
const auth = new GoogleAuth;
const client = new auth.OAuth2(GOOGLE_CLIENT_ID, '', '');

exports.google = oAuthGoogle;

function oAuthGoogle(req, res) {
    if (!req.params.token) {
        res.status(httpStatus.BAD_REQUEST).json({
            error: constants.ERROR_BADPARAMETERS,
            message: constants.ERROR_MSG_BADPARAMETERS
        });
    }
    client.verifyIdToken(req.params.token, GOOGLE_CLIENT_ID, (e, login) => {
        let payload = login.getPayload();
        console.log(payload);
        res.send(payload);
    });
}