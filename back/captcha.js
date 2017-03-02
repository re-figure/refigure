'use strict';

const crypto = require('crypto-js');
const captcha = require('node-captcha');
const httpStatus = require('http-status-codes');

const config = require('js.shared').config;
const cookies = require('js.shared').cookies;

const constants = require('./const');

exports.check = captchaCheck;
exports.generate = captchaGenerate;
exports.validate = captchaValidate;

/**
 * Generate new captcha an an image and set cookie with captcha token
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function captchaGenerate(req, res) {
    let options = {
        fileMode: 2,
        complexity: 1,
        height: 32,
        background: 'rgb(241,241,241)'
    };
    captcha(options, (text, data) => {
        let hmac = crypto.enc.Base64.stringify(crypto.HmacSHA1(text, config.get('jwt.key')));
        cookies.set(res, constants.CAPTCHA_COOKIE, hmac);
        res.end(data);
    });
}

/**
 * Check if captcha is provided in request and equals to the stored (previously generated) captcha
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function captchaValidate(req, res) {
    captchaCheck(req, res);
    res.send({
        error: 0
    });
}

/**
 * Check if captcha is provided in request and equals to the stored (previously generated) captcha
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function captchaCheck(req, res) {
    let text;
    if (req.method === 'POST') {
        text = req.body.captcha;
    } else if (req.method === 'GET') {
        text = req.params.captcha;
    }

    let hmac = cookies.get(req, constants.CAPTCHA_COOKIE);
    if (!text || !hmac) {
        throw {
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_NOCAPTCHA,
            message: 'No captcha provided'
        };
    }

    let hmac2 = crypto.enc.Base64.stringify(crypto.HmacSHA1(text, config.get('jwt.key')));
    if (hmac !== hmac2) {
        throw {
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_WRONGCAPTCHA,
            message: 'A wrong captcha provided'
        };
    }
}