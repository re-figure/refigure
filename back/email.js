'use strict';

const email = require('emailjs');

const config = require('js.shared').config;
const constants = require('./const');

const auth = require('./auth');
const rfUtils = require('./rf-utils');

exports.sendRegistrationEmail = sendRegistrationEmail;
exports.sendChangePasswordEmail = sendChangePasswordEmail;
exports.sendSocialSignupEmail = sendSocialSignupEmail;

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
        emailConfig.text = emailConfig.text.replace(/%LANDING_PAGE%/, landingPage);

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
 * @param {Object} user user whom password reset has ben requested for
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
        emailConfig.text = emailConfig.text.replace(/%LANDING_PAGE%/, landingPage);

        sendMessage(user.Email, emailConfig, htmlText, (err, message) => {
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
 * Create and send the email with tmp password
 * @param {Object} user user registered with social network
 * @param {String} socialNetworkName social network name user registered from
 * @param {Function} cb Callback function
 */
function sendSocialSignupEmail(user, socialNetworkName, cb) {
    getEmailTemplate('social_signup', (r) => {
        if (r.error) {
            return cb(r);
        }
        let emailConfig = r.config;

        let placeholders = {
            LANDING_PAGE: emailConfig.landingPage,
            NAME: rfUtils.getUserName(user),
            SOC_NETWORK: socialNetworkName,
            PWD: user.Password
        };

        let htmlText = r.data;

        for (let placeholder in placeholders) {
            if (placeholders.hasOwnProperty(placeholder)) {
                htmlText = htmlText.replace('%' + placeholder + '%', placeholders[placeholder]);
                emailConfig.text = emailConfig.text.replace('%' + placeholder + '%', placeholders[placeholder]);
            }
        }

        sendMessage(user.Email, emailConfig, htmlText, (err, message) => {
            if (err) {
                console.error('Failed to send temporary password message', err);
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
 * @param {String} landingPage base URL to the landing page
 * @param {Object} user
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
 * @param {String} emailTo   email address to send message to
 * @param {Object} emailConfig   email configuration for the given email type
 * @param {String} htmlText email text as HTML
 * @param {Function} callback ({error: 0, message: 'message'})
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
