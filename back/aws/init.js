'use strict';

const AWS = require('aws-sdk');

module.exports = (config) => {
    if (config.profile) {
        let credentials = new AWS.SharedIniFileCredentials({
            profile: config.profile
        });

        AWS.config.update({
            credentials: credentials
        });
    }

    if (config.region) {
        AWS.config.update({
            region: config.region
        });
    }
};