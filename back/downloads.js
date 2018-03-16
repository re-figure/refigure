'use strict';

const httpStatus = require('http-status-codes');

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');

exports.getDownloads = getDownloads;

function getDownloads(req, res) {
    db.cbFind(db.model.TABLE_DOWNLOADS, {}, (err, results) => {
        if (err) {
            console.error(err.code, err.message);
            rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
            return;
        }

        res.send({data: results});
    });
}
