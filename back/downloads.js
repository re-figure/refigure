'use strict';

const httpStatus = require('http-status-codes');

const constants = require('./const');
const uuid = require('uuid');
const db = require('./db');
const rfUtils = require('./rf-utils');
const utils = require('js.shared').utils;

exports.getDownloads = getDownloads;
exports.updateDownload = updateDownload;
exports.createDownload = createDownload;

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

function createDownload(req, res) {
    if (!rfUtils.checkStringNotEmpty(req.body.Email)) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            'Email is required'
        );
    }
    db.pool.query(`SELECT * FROM ExtensionDownload WHERE Email = ?`, [req.body.Email], (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(
                res,
                httpStatus.INTERNAL_SERVER_ERROR,
                constants.ERROR_SQL,
                constants.ERROR_MSG_SQL
            );
        }
        const _oldRecord = results[0];
        if (utils.isset(_oldRecord)) {
            const _toUpdate = {
                DownloadsCounter: _oldRecord.DownloadsCounter + 1
            };
            return updateDownloadsRow(_oldRecord[db.model.ID], _toUpdate, res);
        } else {
            const q = 'INSERT INTO ExtensionDownload (`ID, `Email`) VALUES (?, ?)';
            const params = [uuid.v1(), req.body.Email];

            db.pool.query(q, params, (err) => {
                if (err) {
                    console.log('Failed to log extension download', err);
                    return rfUtils.error(
                        res,
                        httpStatus.INTERNAL_SERVER_ERROR,
                        constants.ERROR_SQL,
                        'Failed to log extension download'
                    );
                }
                res.send({error: 0});
            });
        }
    });
}

function updateDownload(req, res) {
    const email = utils.get(req, 'body.Email');
    if (!utils.isset(email)) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            'Email is required'
        );
    }

    db.pool.query(`SELECT * FROM ExtensionDownload WHERE Email = ?`, [email], (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(
                res,
                httpStatus.INTERNAL_SERVER_ERROR,
                constants.ERROR_SQL,
                constants.ERROR_MSG_SQL
            );
        }
        if (results.length === 0) {
            return rfUtils.error(
                res,
                httpStatus.INTERNAL_NOT_FOUND,
                constants.ERROR_SQLNOTFOUND,
                'Record not found by this Email'
            );
        }
        const _oldRecord = results[0];
        updateDownloadsRow(_oldRecord[db.model.ID], req.body, res);
    });
}

function updateDownloadsRow(id, body, res) {
    const fields = getUpdateData(body);
    const params = [];
    let q = 'UPDATE ExtensionDownload SET ';
    Object.keys(fields).forEach((key) => {
        if (params.length > 0) {
            q += ', ';
        }
        q += key + ' = ?';
        params.push(fields[key]);
    });
    q += ' WHERE ?? = ?';
    params.push(db.model.ID);
    params.push(id);

    db.pool.query(q, params, (err) => {
        if (err) {
            console.log('Failed to update Extension Download', err);
            return rfUtils.error(
                res,
                httpStatus.INTERNAL_SERVER_ERROR,
                constants.ERROR_SQL,
                'Failed to update Extension Download'
            );
        }
        res.send({
            error: 0
        });
    });
}

function getUpdateData(params) {
    const ret = {};
    ['DownloadsCounter'].forEach(_f => {
        if (utils.isset(params[_f])) {
            ret[_f] = params[_f];
        }
    });

    //date fields
    ['DateRegistered', 'DateRemoved'].forEach(_f => {
        if (utils.isset(params[_f])) {
            ret[_f] = new Date(params[_f]);
        }
    });
    return ret;
}
