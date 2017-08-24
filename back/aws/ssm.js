'use strict';

const AWS = require('aws-sdk');
const $u = require('js.shared').utils;

exports.getParameters = getParameters;
exports.getParameter = getParameter;
exports.getConfiguration = getConfiguration;

/**
 * @name getParameters
 * @param {String}      paramName
 * @returns {Promise}
 */
function getParameters(paramName) {
    let ssm = new AWS.SSM();
    let params = {
        Names: [
            paramName
        ],
        WithDecryption: true
    };

    return new Promise((resolve, reject) => {
        ssm.getParameters(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Parameters[0]['Value']);
            }
        });
    });
}

/**
 * @name getParameter
 * @param {String}      paramName
 * @returns {Promise}
 */
function getParameter(paramName) {
    let ssm = new AWS.SSM();
    let params = {
        Name: paramName,
        WithDecryption: true
    };

    return new Promise((resolve, reject) => {
        ssm.getParameter(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Parameter['Value']);
            }
        });
    });
}

/**
 * @name getConfiguration
 * @param {String}      confName
 * @returns {Promise}
 */
function getConfiguration(confName) {
    return getParameter(confName)
        .then((val) => {
            let conf = {};
            val
                .split(/[\n,;]/)
                .forEach((_v) => {
                    let fv = _v.split(/[=]/);
                    $u.set(conf, fv[0], fv[1]);
                });
            return conf;
        });
}
