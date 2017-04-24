'use strict';

const httpStatus = require('http-status-codes');
const uuid = require('node-uuid');

const utils = require('js.shared').utils;
const vars = require('js.shared').vars;

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');
const auth = require('./auth');
const metapublications = require('./metapublications');

exports.checkFigures = checkFigures;
exports.normaliseURL = normaliseURL;
exports.normaliseDOIFigure = normaliseDOIFigure;
exports.normaliseCaption = normaliseCaption;
exports.getFigure = getFigure;
exports.deleteFigure = deleteFigure;
exports.addOrUpdateFigure = addOrUpdateFigure;

function normaliseURL(url) {
    if (rfUtils.checkStringNotEmpty(url)) {
        return url.toLowerCase().substr(0, 255);
    }
    return '';
}

function normaliseCaption(caption) {
    if (rfUtils.checkStringNotEmpty(caption)) {
        return caption.toLowerCase().substr(0, 255);
    }
    return '';
}

function normaliseDOIFigure(doi) {
    if (rfUtils.checkStringNotEmpty(doi)) {
        return doi.toLowerCase();
    }
    return doi;
}

function areFiguresTheSame(figure1, figure2, normalize) {
    if (!(figure1 && figure2)) {
        return false;
    }
    if (rfUtils.checkStringNotEmpty(figure1.DOIFigure) &&
        rfUtils.checkStringNotEmpty(figure2.DOIFigure)
    ) {
        if (normalize) {
            if (normaliseDOIFigure(figure1.DOIFigure) === normaliseDOIFigure(figure2.DOIFigure)) {
                return true;
            }
        } else {
            if (figure1.DOIFigure === figure2.DOIFigure) {
                return true;
            }
        }
    }
    if (rfUtils.checkStringNotEmpty(figure1.KeyURL) &&
        rfUtils.checkStringNotEmpty(figure2.KeyURL)
    ) {
        if (figure1.KeyURL === figure2.KeyURL) {
            return true;
        }
    }
    if (rfUtils.checkStringNotEmpty(figure1.URL) &&
        rfUtils.checkStringNotEmpty(figure2.URL)
    ) {
        if (normaliseURL(figure1.URL) === normaliseURL(figure2.URL)) {
            return true;
        }
    }
    return false;
}

/**
 * Check if the listed figures ({URL:... DOIFigure:...}) are in the database
 * return list of matching figures
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function checkFigures(req, res) {
    if (!(req.body && req.body.figures && Array.isArray(req.body.figures) && req.body.figures.length > 0)) {
        rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_BADPARAMETERS, 'No list of figures to check provided');
        return;
    }

    // dedup input figures and normalize its URL/DOI
    let dedupedFigures = [];
    for (let figure of req.body.figures) {
        if (rfUtils.checkStringNotEmpty(figure.DOIFigure)) {
            figure.DOIFigure = normaliseDOIFigure(figure.DOIFigure);
        }
        if (rfUtils.checkStringNotEmpty(figure.URL)) {
            figure.KeyURL = normaliseURL(figure.URL);
        }
        let found = false;
        for (let exFig of dedupedFigures) {
            if (areFiguresTheSame(exFig, figure)) {
                found = true;
                break;
            }
        }
        if (!found) {
            dedupedFigures.push(figure);
        }
    }

    let foundFigures = [];
    let foundMetapubications = {};
    let result = {
        data: {
            figures: [],
            metapublications: []
        }
    };

    checkFiguresOneByOne(dedupedFigures, () => {
        // dedup output
        foundFigures.forEach((figure) => {
            let found = false;
            for (let f of result.data.figures) {
                if (areFiguresTheSame(f, figure)) {
                    f.FoundInCollectionsCounter = Math.max(f.FoundInCollectionsCounter, figure.FoundInCollectionsCounter);
                    found = true;
                    break;
                }
            }
            if (!found) {
                result.data.figures.push(figure);
            }
        });
        result.data.metapublications = Object.keys(foundMetapubications);
        res
            .status(httpStatus.OK)
            .send(result);
    });

    function checkFiguresOneByOne(figures, cb) {
        if (figures.length === 0) {
            return cb();
        }
        checkOneFigure(figures.shift(), (r) => {
            if (r.error) {
                result.error = r.error;
                result.message = r.message;
                cb();
            } else {
                checkFiguresOneByOne(figures, cb);
            }
        });
    }

    function checkOneFigure(fig, cb) {
        checkURL(fig, (r) => {
            if (r.error) {
                if (r.error === constants.ERROR_SQLNOTFOUND) {
                    checkDOIFigure(fig, (r2) => {
                        if (r2.error) {
                            if (r.error === constants.ERROR_SQLNOTFOUND) {
                                return cb({});
                            } else {
                                cb(r);
                            }
                        } else {
                            if (r2.data && Array.isArray(r2.data) && r2.data.length > 0) {
                                foundFigures.push(countCollections(r2.data));
                            }
                            cb({});
                        }
                    });
                } else {
                    cb(r);
                }
            } else {
                if (r.data && Array.isArray(r.data) && r.data.length > 0) {
                    foundFigures.push(countCollections(r.data));
                }
                cb({});
            }
        });
    }

    function checkDOIFigure(fig, cb) {
        if (rfUtils.checkStringNotEmpty(fig.DOIFigure)) {
            db.cbFind(db.model.TABLE_FIGURE, {['DOIFigure']: normaliseDOIFigure(fig.DOIFigure)}, (err, results) => {
                if (err) {
                    cb({
                        error: constants.ERROR_SQL,
                        message: constants.ERROR_MSG_SQL
                    });
                } else {
                    cb({
                        data: results
                    });
                }
            });
        } else {
            cb({error: constants.ERROR_SQLNOTFOUND});
        }
    }

    function checkURL(fig, cb) {
        if (rfUtils.checkStringNotEmpty(fig.URL)) {
            db.cbFind(db.model.TABLE_FIGURE, {['KeyURL']: normaliseURL(fig.URL)}, (err, results) => {
                if (err) {
                    cb({
                        error: constants.ERROR_SQL,
                        message: constants.ERROR_MSG_SQL
                    });
                } else {
                    cb({
                        data: results
                    });
                }
            });
        } else {
            cb({error: constants.ERROR_SQLNOTFOUND});
        }
    }

    function countCollections(foundFigures) {
        let counters = {};

        // we assume a Metapublication cannot contain duplicates
        // but for sure we will dedup and count unique collections where the figure occurs
        foundFigures.forEach((figure) => {
            counters[figure.MetapublicationID] = true;
            foundMetapubications[figure.MetapublicationID] = true;
        });
        foundFigures[0].FoundInCollectionsCounter = Object.keys(counters).length;
        return foundFigures[0];
    }
}

/**
 * Retrieve a Figure with related information from the DB by Figure ID
 * @param {string} id Figure ID
 * @param {CommonCallback} cb
 */
function get(id, cb) {
    db.pool.query({sql: `
        SELECT * 
          FROM Figure
          JOIN Metapublication ON Figure.MetapublicationID = Metapublication.ID
          JOIN User AS UserFigure ON UserFigure.ID = Figure.UserID
          JOIN User AS UserMetapublication ON UserMetapublication.ID = Metapublication.UserID
          LEFT JOIN Visit ON Visit.MetapublicationID = Metapublication.ID
         WHERE Figure.ID = ?
    `, nestTables: true}, [id], (err, results) => {
        if (err) {
            console.log(err);
            return cb({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        if (results.length === 0) {
            return cb({
                http: httpStatus.INTERNAL_NOT_FOUND,
                error: constants.ERROR_SQLNOTFOUND,
                message: 'No Figure found'
            });
        }
        let fig = results[0].Figure;
        fig.User = metapublications.arrangeUserRecord(results[0].UserFigure);
        fig.Metapublication = results[0].Metapublication;
        fig.Metapublication.User = metapublications.arrangeUserRecord(results[0].UserMetapublication);
        fig.Metapublication.Visit = metapublications.arrangeVisitRecord(results[0].Visit, fig.MetapublicationID);

        return cb({ data: { Figure: fig } });
    });
}

/**
 * Get figure by ID
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function getFigure(req, res) {
    let id = rfUtils.getObjectId(req, res);
    get(id, (r) => {
       if (r.error) {
           return rfUtils.error(res, r.http, r.error, r.message);
       }
       res.send(r);
    });
}

/**
 * Delete a Figure by its ID
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function deleteFigure(req, res) {
    let id = rfUtils.getObjectId(req, res);
    get(id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        if (!auth.checkObjectAccess(req, r.data.Figure.UserID)) {
            if (!auth.checkObjectAccess(req, r.data.Figure.Metapublication.UserID)) {
                return rfUtils.error(res, httpStatus.FORBIDDEN, constants.ERROR_FORBIDDEN, constants.ERROR_MSG_FORBIDDEN);
            }
        }

        db.pool.query('DELETE FROM Figure WHERE ID = ?', [id], (err) => {
            if (err) {
                console.log('Failed to delete Figure', err);
            }
            res.send(r);
        });
    });
}

/**
 * Create new Figure or update existing one
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function addOrUpdateFigure(req, res) {
    let id = vars.get(req, 'ID');
    if (utils.isset(id)) {
        updateFigure(req, res);
    } else {
        createFigure(req, res);
    }
}

function getUpdateData(params) {
    let m = {};
    ['Caption', 'Authors', 'Features', 'Legend', 'DOI', 'URL', 'DOIFigure'].forEach((key) => {
        if (params[key]) {
            m[key] = params[key];
        }
    });
    if (m['URL']) {
        m['KeyURL'] = normaliseURL(m['URL']);
    }
    if (m['Caption']) {
        m['KeyCaption'] = normaliseCaption(m['Caption']);
    }
    if (m['DOIFigure']) {
        m['DOIFigure'] = normaliseDOIFigure(m['DOIFigure']);
    }
    return m;
}

/**
 * Update existing Figure
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function updateFigure(req, res) {
    let id = vars.get(req, 'ID');
    if (!utils.isset(id)) {
        return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'No Figure ID provided');
    }

    get(id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        if (!auth.checkObjectAccess(req, r.data.Figure.UserID)) {
            if (!auth.checkObjectAccess(req, r.data.Figure.Metapublication.UserID)) {
                return rfUtils.error(res, httpStatus.FORBIDDEN, constants.ERROR_FORBIDDEN, constants.ERROR_MSG_FORBIDDEN);
            }
        }
        let upd = getUpdateData(req.body);
        if (Object.keys(upd).length === 0) {
            return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'No data for update provided');
        }

        let params = [];
        let q = 'UPDATE Figure SET ';
        Object.keys(upd).forEach((key) => {
            if (params.length > 0) {
                q += ', ';
            }
            q += key + ' = ?';
            params.push(upd[key]);
        });
        q += ' WHERE ?? = ?';
        params.push(db.model.ID);
        params.push(id);
        db.pool.query(q, params, (err) => {
            if (err) {
                console.log('Failed to update Figure', err);
                return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, 'Failed to update Figure');
            }
            get(id, (r) => {
                if (r.error) {
                    return rfUtils.error(res, r.http, r.error, r.message);
                }
                res.send(r);
            });
        });
    });
}


/**
 * Create new Figure
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function createFigure(req, res) {
    let upd = getUpdateData(req.body);
    if (Object.keys(upd).length === 0) {
        return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'No Figure data provided');
    }
    if (typeof req.body.MetapublicationID === 'undefined') {
        return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'No Metapublication provided');
    }
    db.pool.query('SELECT * FROM Metapublication WHERE ID = ?', [req.body.MetapublicationID], (err, results) => {
        if (err) {
            console.log('Failed to determine Metapublication while new Figure creation', err);
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, 'Failed to identify Metapublication');
        }
        if (results.length === 0) {
            return rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_SQLNOTFOUND, 'Metapublication is not found');
        }
        if (!auth.checkObjectAccess(req, results[0].UserID)) {
            return rfUtils.error(res, httpStatus.FORBIDDEN, constants.ERROR_FORBIDDEN, constants.ERROR_MSG_FORBIDDEN);
        }
        upd[db.model.ID] = uuid.v1();
        upd['UserID'] = req.User.ID;
        upd['MetapublicationID'] = req.body.MetapublicationID;

        let params = [];
        let q = 'INSERT INTO Figure (';
        let v = ' VALUES (';
        Object.keys(upd).forEach((key) => {
            if (params.length > 0) {
                q += ', ';
                v += ', ';
            }
            q += key;
            v += '?';
            params.push(upd[key]);
        });
        q += ')' + v + ')';
        db.pool.query(q, params, (err) => {
            if (err) {
                console.log('Failed to create new Figure', err);
                return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, 'Failed to create new Figure');
            }
            get(upd[db.model.ID], (r) => {
                if (r.error) {
                    return rfUtils.error(res, r.http, r.error, r.message);
                }
                res.send(r);
            });
        });
    });
}
