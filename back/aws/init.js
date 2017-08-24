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

    AWS.config.update({
        region: config.region
    });
};