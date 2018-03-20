'use strict';

const httpStatus = require('http-status-codes');

const constants = require('./const');
const uuid = require('uuid');
const db = require('./db');
const rfUtils = require('./rf-utils');
const mail = require('./email');
const utils = require('js.shared').utils;
const config = require('js.shared').config;

exports.getDownloads = getDownloads;
exports.addOrUpdateDownload = addOrUpdateDownload;
exports.addOrUpdateRow = addOrUpdateRow;

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

function addOrUpdateDownload(req, res) {
    addOrUpdateRow(req.body, function (r) {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        res.send({error: 0});
    });
}

function addOrUpdateRow(params, callback) {
    const userInfo = getModelData(params);
    convertModel(userInfo);
    if (!rfUtils.checkStringNotEmpty(userInfo.Email)) {
        callback({
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_BADPARAMETERS,
            message: 'Email is required'
        });
    }
    db.pool.query(`SELECT * FROM ExtensionDownload WHERE Email = ?`, [userInfo.Email], (err, results) => {
        if (err) {
            console.log(err);
            return callback({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        const _oldRecord = results[0];
        const _params = [];
        let _q = '';
        let queryType;
        if (utils.isset(_oldRecord)) {
            queryType = 'update';
            _q = 'UPDATE ExtensionDownload SET ';

            //update Data only if it is "longer"
            if (userInfo.Data.length <= JSON.stringify(_oldRecord.Data).length) {
                delete userInfo.Data;
            }
            //assuming that its a new download if no Register or Removing dates
            if (!userInfo.DateRemoved && !userInfo.DateRegistered) {
                userInfo.DownloadsCounter = _oldRecord.DownloadsCounter + 1;
            }

            Object.keys(userInfo).forEach((key) => {
                if (_params.length > 0) {
                    _q += ', ';
                }
                _q += key + ' = ?';
                _params.push(userInfo[key]);
            });
            _q += ' WHERE ?? = ?';
            _params.push(db.model.ID);
            _params.push(_oldRecord[db.model.ID]);
        } else {
            queryType = 'insert';
            userInfo.ID = uuid.v1();
            const _fields = [];
            const _qMarks = [];
            Object.keys(userInfo).forEach((key) => {
                _fields.push(key);
                _qMarks.push('?');
                _params.push(userInfo[key]);
            });
            _q = 'INSERT INTO ExtensionDownload (' + _fields.join(',') + ') VALUES (' + _qMarks.join(',') + ')';
        }
        db.pool.query(_q, _params, (err) => {
            if (err) {
                console.log('Failed to ' + queryType + ' extension download row', err);
                console.log('Params', _q, _params);
                return callback({
                    http: httpStatus.INTERNAL_SERVER_ERROR,
                    error: constants.ERROR_SQL,
                    message: 'Failed to ' + queryType + ' extension download'
                });
            }
            //send notify email if DateRemoved property changed to something
            if (!_oldRecord.DateRemoved && userInfo.DateRemoved && config.get('onUninstall.email')) {
                return mail.sendOnUserEvent(userInfo, 'uninstallation', () => {
                    callback({data: userInfo});
                });
            }
            console.log('Extension download row ' + queryType + ' successful', userInfo);
            callback({data: userInfo});
        });
    });
}

function getModelData(params) {
    const ret = {};
    ['Email'/*, 'DownloadsCounter'*/, 'Data'].forEach(_f => {
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

function convertModel(model) {
    model.Data = model.Data || {};
    if (model.Data.source === constants.EXTENSION_USER_SOURCE_GOOGLE) {
        const associations = {
            'email': 'Email',
            'family_name': 'LastName',
            'given_name': 'FirstName',
            'link': 'Link',
            'gender': 'Gender',
            'picture': 'Picture',
            'id': 'SocialID',
        };

        Object.keys(model.Data).forEach(googleKey => {
            if (associations[googleKey]) {
                model.Data[associations[googleKey]] = model.Data[googleKey];
            }
            delete model.Data[googleKey];
        });
        model.Data.Source = 'google';
    }
    model.Email = model.Email || model.Data.Email;
    model.Data = JSON.stringify(model.Data);
}
