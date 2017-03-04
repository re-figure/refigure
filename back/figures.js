'use strict';

const httpStatus = require('http-status-codes');

const utils = require('js.shared').utils;

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');
const metapublications = require('./metapublications');

exports.checkFigures = checkFigures;
exports.normaliseURL = normaliseURL;
exports.normaliseDOIFigure = normaliseDOIFigure;
exports.getFigure = getFigure;

function normaliseURL(url) {
    if (rfUtils.checkStringNotEmpty(url)) {
        return url.toLowerCase();
    }
    return url;
}

function normaliseDOIFigure(doi) {
    if (rfUtils.checkStringNotEmpty(doi)) {
        return doi.toLowerCase();
    }
    return doi;
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

    let result = {
        data: {
            figures: []
        }
    };

    checkFiguresOneByOne(req.body.figures, () => {
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
        checkDOIFigure(fig, (r) => {
            if (r.error) {
                if (r.error === constants.ERROR_SQLNOTFOUND) {
                    checkURL(fig, (r2) => {
                        if (r2.error) {
                            if (r.error === constants.ERROR_SQLNOTFOUND) {
                                return cb({});
                            } else {
                                cb(r);
                            }
                        } else {
                            if (r2.data && Array.isArray(r2.data) && r2.data.length) {
                                result.data.figures.push(r.data[0]);
                            }
                            cb({});
                        }
                    });
                } else {
                    cb(r);
                }
            } else {
                if (r.data && Array.isArray(r.data) && r.data.length) {
                    result.data.figures.push(r.data[0]);
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
}

/**
 * Get figure by ID
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function getFigure(req, res) {
    let id = rfUtils.getObjectId(req, res);
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
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
        }
        if (results.length === 0) {
            return rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_SQLNOTFOUND, 'No Figure found');
        }
        let rec = {
            Figure: results[0].Figure,
            Metapublication: results[0].Metapublication,
        };
        rec.Figure.User = metapublications.arrangeUserRecord(results[0].UserFigure);
        rec.Metapublication.User = metapublications.arrangeUserRecord(results[0].UserMetapublication);
        rec.Metapublication.Visit = metapublications.arrangeVisitRecord(results[0].Visit, rec.Metapublication.ID);

        res.send({
            data: rec
        });
    });
}