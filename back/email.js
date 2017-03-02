'use strict';

const email = require('emailjs');

const config = require('js.shared').config;
const utils = require('js.shared').utils;

const auth = require('./auth');
const rfUtils = require('./rf-utils');

exports.sendRegistrationEmail = sendRegistrationEmail;
exports.sendChangePasswordEmail = sendChangePasswordEmail;

/**
 * Create and send registration confirmation email
 * @param {Object} user user to be sent the confirmation email
 * @param {Function} cb Callback function
 */
function sendRegistrationEmail(user, cb) {
    getEmailTemplate('registration', (r) => {
        if (r.error) {
            cb(r);
            return;
        }

        let name = rfUtils.getUserName(user);
        let emailConfig = r.config;
        let landingPage = makeRegistrationConfirmationUrl(emailConfig.landingPage, user);

        let htmlText = r.data.replace(/%NAME%/, name);
        htmlText = htmlText.replace(/%LANDING_PAGE%/, landingPage);

        sendMessage(user.Email, emailConfig, htmlText, (err, message) => {
            if (err) {
                console.error('Failed to send registration confirmation message', err);
            }
        });

        cb({
            error: 0,
            data: user
        });
    });
}

/**
 * Create and send the reset password email when a link to the change password is provided
 * @param user user whom password reset has ben requested for
 * @param {Function} cb Callback function
 */
function sendChangePasswordEmail(user, cb) {
    getEmailTemplate('changepwd', (r) => {
        if (r.error) {
            cb(r);
            return;
        }

        let name = rfUtils.getUserName(user);
        let emailConfig = r.config;
        let landingPage = makeChangePasswordUrl(emailConfig.landingPage, user);

        let htmlText = r.data.replace(/%NAME%/, name);
        htmlText = htmlText.replace(/%LANDING_PAGE%/, landingPage);

        sendMessage(user.email, emailConfig, htmlText, (err, message) => {
            if (err) {
                console.error('Failed to send change password confirmation message', err);
            }
        });

        cb({
            error: 0,
            data: user
        });
    });
}

/**
 * Create email server instance based on configuration parameters from package.json
 * @returns {*} and email server instance to be used for sending emails
 */
function getEmailServer() {
    return email.server.connect({
        user: config.get('smtp.user'),
        password: config.get('smtp.password'),
        host: config.get('smtp.host'),
        port: config.get('smtp.port'),
        tls: config.get('smtp.tls')
    });
}

/**
 * Read email template file (/back/emails/[template]/template.html)
 * and email configuration file (/back/emails/[template]/config.json)
 * The template HTML file is considered to be in utf8 encoding
 * @param {String} template template name
 * @param {Function} callback ({error:0, config:config file, data: contents of the HTML template)
 */
function getEmailTemplate(template, callback) {
    let emailDir = '/emails/' + template + '/';
    let templatePath = __dirname + emailDir + 'template.html';
    const fs = require('fs');
    fs
        .readFile(templatePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to read template file ' + templatePath, err);
                callback({
                    error: constants.ERROR_EMAIL,
                    message: 'Failed to read email message template file ' + template
                });
            } else {
                let emailConfig = require(__dirname + emailDir + 'config.json');
                callback({
                    error: 0,
                    config: emailConfig,
                    data: data
                });
            }
        });
}

/**
 * Construct URL to be used in a registration confirmation email:
 * clicking on this URL brings user to a registration confirmation
 * landing page where users submits confirmation form
 * @param landingPage base URL to the landing page
 * @param user
 * @returns {String} Confirmation page URL with security token
 */
function makeRegistrationConfirmationUrl(landingPage, user) {
    let token = auth.createToken(user);
    return landingPage.replace(/%token%/, token);
}

function makeChangePasswordUrl(landingPage, user) {
    let token = auth.createTokenWithPassword(user);
    return landingPage.replace(/%token%/, token);
}

/**
 * Send an email message
 * @param emailTo   email address to send message to
 * @param emailConfig   email configuration for the given email type
 * @param htmlText email text as HTML
 * @param callback(er, message)
 */
function sendMessage(emailTo, emailConfig, htmlText, callback) {
    let message = {
        text: emailConfig.text,
        from: emailConfig.from,
        to: emailTo,
        subject: emailConfig.subject,
        attachment: [{
            data: htmlText,
            alternative: true
        }]
    };

    setTimeout(() => {
        getEmailServer()
            .send(message, function (err, message) {
                callback(err, message);
            });
    }, 1);
}
