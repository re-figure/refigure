'use strict';

const httpStatus = require('http-status-codes');
const uuid = require('node-uuid');

const utils = require('js.shared').utils;
const vars = require('js.shared').vars;

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');
const auth = require('./auth');

exports.getMetapublication = getMetapublication;
exports.arrangeVisitRecord = arrangeVisitRecord;
exports.arrangeUserRecord = arrangeUserRecord;
exports.mostVisited = mostVisited;
exports.myMetapublications = myMetapublications;
exports.searchMetapublications = searchMetapublications;
exports.addOrUpdateMetapublication = addOrUpdateMetapublication;
exports.deleteMetapublication = deleteMetapublication;
exports.flagMetapublication = flagMetapublication;
exports.getStatistics = getStatistics;
exports.handleParsers = handleParsers;

/**
 * Clean User record before output
 * @param {Object} user User record
 */
function arrangeUserRecord(user) {
    let r = {};
    Object.keys(user).forEach((key) => {
        if (key !== 'Password') {
            r[key] = user[key];
        }
    });
    return r;
}

/**
 * arrange db record of Visit table
 * assuming it can be null
 * @param {Object} rec
 * @param {Number} id
 */
function arrangeVisitRecord(rec, id) {
    let r = {
        Count: 0,
        MetapublicationID: id
    };
    if (rec) {
        Object.keys(rec).forEach((key) => {
            if (rec[key]) {
                r[key] = rec[key];
            }
        });
    }
    return r;
}

/**
 * Retrieve a Metapublication with related data from the db by ID
 * @param {string} id Metapublication ID
 * @param {CommonCallback} cb
 */
function get(id, cb) {
    db.pool.query({sql: `
        SELECT *
          FROM Metapublication
          JOIN User ON User.ID = Metapublication.UserID          
          LEFT JOIN Visit ON Visit.MetapublicationID = Metapublication.ID
         WHERE Metapublication.ID = ?
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
                http: httpStatus.NOT_FOUND,
                error: constants.ERROR_SQLNOTFOUND,
                message: 'No Metapublication found'
            });
        }
        let rec = {
            Metapublication: results[0].Metapublication
        };
        rec.Metapublication.User = arrangeUserRecord(results[0].User);
        rec.Metapublication.Visit = arrangeVisitRecord(results[0].Visit, rec.Metapublication.ID);

        db.pool.query({sql: `
            SELECT * FROM Figure
              JOIN User ON User.ID = Figure.UserID
             WHERE Figure.MetapublicationID = ?
             ORDER BY Figure.DateCreated 
        `, nestTables:true}, [rec.Metapublication.ID], (err, results) => {
            if (err) {
                console.log(err);
                return cb({
                    http: httpStatus.INTERNAL_SERVER_ERROR,
                    error: constants.ERROR_SQL,
                    message: constants.ERROR_MSG_SQL
                });
            }
            rec.Metapublication.Figures = [];
            for (let r of results) {
                r.Figure.User = arrangeUserRecord(r.User);
                rec.Metapublication.Figures.push(r.Figure);
            }
            cb({data: rec});
        });
    });
}

/**
 * Get metapubliucation by its ID with related data - figures, visits counter
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function getMetapublication(req, res) {
    let id = rfUtils.getObjectId(req, res);
    get(id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        let novisit = vars.get(req, 'novisit');
        if (rfUtils.boolValue(novisit)) {
            res.send(r);
        } else {
            db.pool.query(`
                    INSERT INTO Visit (MetapublicationID, Count) VALUES (?, 1) ON DUPLICATE KEY UPDATE Count = Count + 1
                `, [id], (err) => {
                if (err) {
                    console.log(err);
                }
                res.send(r);
            });
        }
    });
}

/**
 * Get list of most visited metapublications (with first figure) up to 'limit'
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function mostVisited(req, res) {
    let limit = vars.get(req, 'limit');
    if (!(typeof limit === 'number' && limit > 0 && limit <= constants.MAX_RESULTS)) {
        limit = constants.DEFAULT_MOST_VISITED_LIMIT;
    }
    db.pool.query({sql:`
        SELECT *, 
         (SELECT COUNT(*) FROM Figure WHERE Figure.MetapublicationID = Metapublication.ID) AS FiguresCount
          FROM Metapublication
          JOIN User As UserMetapublication ON UserMetapublication.ID = Metapublication.UserID 
          LEFT JOIN Visit ON Visit.MetapublicationID = Metapublication.ID
          LEFT JOIN (Figure, User AS UserFigure) 
                 ON (
                      Figure.ID = (
	                                SELECT F.ID 
                                      FROM Figure AS F 
	                                 WHERE F.MetapublicationID = Metapublication.ID 
                                  ORDER BY F.DateCreated
                                   LIMIT 1
                                  )
                      AND
                      UserFigure.ID = Figure.UserID
                   )
          ORDER BY Visit.Count DESC
          LIMIT ?
    `, nestTables:true}, [limit], (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
        }
        let recs = [];
        if (results.length > 0) {
            for (let r of results) {
                let x = {
                    Metapublication: r.Metapublication
                };
                x.Metapublication.User = arrangeUserRecord(r.UserMetapublication);
                x.Metapublication.Visit = arrangeVisitRecord(r.Visit, x.Metapublication.ID);
                x.Metapublication.Figures = [];
                if (r.Figure && r.Figure.ID) {
                    r.Figure.User = r.UserFigure;
                    x.Metapublication.Figures.push(r.Figure);
                }
                x.Metapublication.FiguresCount = r[''].FiguresCount;
                recs.push(x);
            }
        }

        res.send({
            data: recs
        });
    });
}

/**
 * Get list of user's metapublications
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function myMetapublications(req, res) {
    let r = rfUtils.parseQuery(undefined, req.query);
    if (r.error) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            constants.ERROR_MSG_BADPARAMETERS
        );
    }
    let query = r.data;

    let params = [];
    let q = `
        SELECT SQL_CALC_FOUND_ROWS *, 
         MATCH(Metapublication.Keywords, Metapublication.Title, Metapublication.Description) AGAINST (?) AS Relevance,
         (SELECT COUNT(*) FROM Figure WHERE Figure.MetapublicationID = Metapublication.ID) AS FiguresCount
          FROM Metapublication
          JOIN User AS UserMetapublication ON UserMetapublication.ID = Metapublication.UserID
          LEFT JOIN Visit ON Visit.MetapublicationID = Metapublication.ID
          LEFT JOIN (Figure, User AS UserFigure) 
                 ON (
                      Figure.ID = (
	                                SELECT F.ID 
                                      FROM Figure AS F 
	                                 WHERE F.MetapublicationID = Metapublication.ID 
                                  ORDER BY F.DateCreated
                                   LIMIT 1
                                  )
                      AND
                      UserFigure.ID = Figure.UserID
                   )
         WHERE Metapublication.UserID = ?
    `;
    if (utils.isset(query.query) && rfUtils.checkStringNotEmpty(query.query)) {
        params.push(query.query);
    } else {
        params.push('');
    }
    params.push(req.User.ID);
    if (utils.isset(query.query) && rfUtils.checkStringNotEmpty(query.query)) {
        let subQuery = `
            SELECT DISTINCT MetapublicationID
            FROM FullTextSearch
            WHERE MATCH(Value) AGAINST (?)
        `;
        params.push(query.query);
        if (
            rfUtils.checkStringNotEmpty(req.query.queryField) &&
            constants.FULLTEXT_SEARCH_FIELDS.indexOf(req.query.queryField) !== -1
        ) {
            subQuery += ` AND Name=?`;
            params.push(req.query.queryField);
        }

        q += ` AND Metapublication.ID IN (` + subQuery + `)`;
    }
    if (query.sortField) {
        let valid = false;
        for (let f of ['Relevance', 'Visit.Count', 'FiguresCount', 'Metapublication.Title']) {
            valid = true;
            break;
        }
        if (!valid) {
            return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'Wrong sort provided');
        }
        q += ' ORDER BY ?? ' + query.sortDirection;
        params.push(query.sortField);
    } else {
        if (utils.isset(query.query) && rfUtils.checkStringNotEmpty(query.query)) {
            q += ' ORDER BY Relevance DESC';
        } else {
            q += ' ORDER BY Metapublication.Title ASC';
        }
    }
    q += ' LIMIT ' + query.from + ', ' + query.size;
    q += '; SELECT FOUND_ROWS() AS count;';
    db.pool.query({sql: q, nestTables: true}, params, (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
        }
        let recs = [];
        let found = 0;
        if (results[0].length > 0) {
            found = results[1][0][''].count;
            for (let r of results[0]) {
                let x = {
                    Metapublication: r.Metapublication
                };
                x.Metapublication.User = arrangeUserRecord(r.UserMetapublication);
                x.Metapublication.Visit = arrangeVisitRecord(r.Visit, x.Metapublication.ID);
                x.Metapublication.Figures = [];
                if (r.Figure && r.Figure.ID) {
                    r.Figure.User = r.UserFigure;
                    x.Metapublication.Figures.push(r.Figure);
                }
                x.Metapublication.FiguresCount = r[''].FiguresCount;
                x.Relevance = r[''].Relevance;
                recs.push(x);
            }
        }

        res.send({
            data: {
                query: query,
                found: found,
                results: recs
            }
        });
    });
}

/**
 * Search metapublications
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function searchMetapublications(req, res) {
    let r = rfUtils.parseQuery(undefined, req.query);
    if (r.error) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            constants.ERROR_MSG_BADPARAMETERS
        );
    }
    let query = r.data;

    let params = [];
    let q = `
        SELECT SQL_CALC_FOUND_ROWS *,
         MATCH(Metapublication.Keywords, Metapublication.Title, Metapublication.Description) AGAINST (?) AS Relevance,
         (SELECT COUNT(*) FROM Figure WHERE Figure.MetapublicationID = Metapublication.ID) AS FiguresCount
          FROM Metapublication
          JOIN User AS UserMetapublication ON UserMetapublication.ID = Metapublication.UserID
          LEFT JOIN Visit ON Visit.MetapublicationID = Metapublication.ID
          LEFT JOIN (Figure, User AS UserFigure) 
                 ON (
                      Figure.ID = (
	                                SELECT F.ID 
                                      FROM Figure AS F 
	                                 WHERE F.MetapublicationID = Metapublication.ID 
                                  ORDER BY F.DateCreated
                                   LIMIT 1
                                  )
                      AND
                      UserFigure.ID = Figure.UserID
                   )
    `;
    if (utils.isset(query.query) && rfUtils.checkStringNotEmpty(query.query)) {
        params.push(query.query);
        let subQuery = `
            SELECT DISTINCT MetapublicationID
            FROM FullTextSearch
            WHERE MATCH(Value) AGAINST (?)
        `;

        //if query is like UUID, then wrap word with '"' to prevent relevant search
        //https://dev.mysql.com/doc/refman/5.5/en/fulltext-natural-language.html
        if (/^[^-]{8}\-[^-]{4}\-[^-]{4}\-[^-]{4}\-[^-]{12}$/.test(query.query)) {
            params.push(`"` + query.query + `"`);
        } else {
            params.push(query.query);
        }

        if (
            rfUtils.checkStringNotEmpty(req.query.queryField) &&
            constants.FULLTEXT_SEARCH_FIELDS.indexOf(req.query.queryField) !== -1
        ) {
            subQuery += ` AND Name=?`;
            params.push(req.query.queryField);
        }

        q += ` WHERE Metapublication.ID IN (` + subQuery + `)`;
        if (rfUtils.boolValue(req.query.Flagged)) {
            q += ` AND Metapublication.Flagged = 1`;
        }
    } else {
        params.push('');
        if (rfUtils.boolValue(req.query.Flagged)) {
            q += ` WHERE Metapublication.Flagged = 1`;
        }
    }
    if (query.sortField) {
        let valid = false;
        for (let f of ['Relevance', 'Visit.Count', 'FiguresCount', 'Metapublication.Title']) {
            valid = true;
            break;
        }
        if (!valid) {
            return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'Wrong sort provided');
        }
        q += ' ORDER BY ?? ' + query.sortDirection;
        params.push(query.sortField);
    } else {
        if (utils.isset(query.query) && rfUtils.checkStringNotEmpty(query.query)) {
            q += ' ORDER BY Relevance DESC';
        } else {
            q += ' ORDER BY Metapublication.Title ASC';
        }
    }
    q += ' LIMIT ' + query.from + ', ' + query.size;
    q += '; SELECT FOUND_ROWS() AS count;';
    db.pool.query({sql: q, nestTables: true}, params, (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
        }
        let recs = [];
        let found = 0;
        if (results[0].length > 0) {
            found = results[1][0][''].count;
            for (let r of results[0]) {
                let x = {
                    Metapublication: r.Metapublication
                };
                x.Metapublication.User = arrangeUserRecord(r.UserMetapublication);
                x.Metapublication.Visit = arrangeVisitRecord(r.Visit, x.Metapublication.ID);
                x.Metapublication.Figures = [];
                if (r.Figure && r.Figure.ID) {
                    r.Figure.User = r.UserFigure;
                    x.Metapublication.Figures.push(r.Figure);
                }
                x.Metapublication.FiguresCount = r[''].FiguresCount;
                x.Relevance = r[''].Relevance;
                recs.push(x);
            }
        }

        res.send({
            data: {
                query: query,
                found: found,
                results: recs
            }
        });
    });
}

/**
 * Delete a metapublication by its ID
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function deleteMetapublication(req, res) {

    let id = rfUtils.getObjectId(req);
    get(id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        if (!auth.checkObjectAccess(req, r.data.Metapublication.UserID)) {
            return rfUtils.error(res, httpStatus.FORBIDDEN, constants.ERROR_FORBIDDEN, constants.ERROR_MSG_FORBIDDEN);
        }
        db.pool.query('DELETE FROM Metapublication WHERE ID = ?', [id], (err) => {
            if (err) {
                console.log('Failed to delete Metapublication', err);
                return rfUtils.error(
                    res,
                    httpStatus.INTERNAL_SERVER_ERROR,
                    constants.ERROR_MSG_SQL,
                    constants.ERROR_MSG_SQL
                );
            }
            res.send(r);
        });
    });
}

/**
 * Create new Metapublication or update existing one
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function addOrUpdateMetapublication(req, res) {
    let id = vars.get(req, 'ID');
    if (utils.isset(id)) {
        updateMetapublication(req, res);
    } else {
        createMetapublication(req, res);
    }
}

function getUpdateData(params) {
    let m = {};
    ['Title', 'Description', 'Keywords'].forEach((key) => {
        if (params.hasOwnProperty(key)) {
            m[key] = params[key];
        }
    });
    return m;
}

/**
 * Update existing Metapublication
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function updateMetapublication(req, res) {
    let id = vars.get(req, 'ID');
    if (!utils.isset(id)) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            'No Metapublication ID provided'
        );
    }

    get(id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        if (!auth.checkObjectAccess(req, r.data.Metapublication.UserID)) {
            return rfUtils.error(res, httpStatus.FORBIDDEN, constants.ERROR_FORBIDDEN, constants.ERROR_MSG_FORBIDDEN);
        }
        let upd = getUpdateData(req.body);
        if (Object.keys(upd).length === 0) {
            return rfUtils.error(
                res,
                httpStatus.BAD_REQUEST,
                constants.ERROR_BADPARAMETERS,
                'No data for update provided'
            );
        }

        let params = [];
        let q = 'UPDATE Metapublication SET ';
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
                console.log('Failed to update Metapublication', err);
                return rfUtils.error(
                    res,
                    httpStatus.INTERNAL_SERVER_ERROR,
                    constants.ERROR_SQL,
                    'Failed to update Metapublication'
                );
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
 * Create new Metapublication
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function createMetapublication(req, res) {
    let upd = getUpdateData(req.body);
    if (Object.keys(upd).length === 0) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            'No Metapublication data provided'
        );
    }

    upd[db.model.ID] = uuid.v1();
    upd['UserID'] = req.User.ID;

    let params = [];
    let q = 'INSERT INTO Metapublication (';
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
            console.log('Failed to create new Metapublication', err);
            return rfUtils.error(
                res,
                httpStatus.INTERNAL_SERVER_ERROR,
                constants.ERROR_SQL,
                'Failed to create new Metapublication'
            );
        }
        get(upd[db.model.ID], (r) => {
            if (r.error) {
                return rfUtils.error(res, r.http, r.error, r.message);
            }
            res.send(r);
        });
    });
}

/**
 * Mark the metapublication as Flagged
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function flagMetapublication(req, res) {
    let id = vars.get(req, 'ID');
    if (!utils.isset(id)) {
        return rfUtils.error(
            res,
            httpStatus.BAD_REQUEST,
            constants.ERROR_BADPARAMETERS,
            'No Metapublication ID provided'
        );
    }

    get(id, (r) => {
        if (r.error) {
            return rfUtils.error(res, r.http, r.error, r.message);
        }
        let flagged = true;
        if (typeof req.body.Flagged !== 'undefined') {
            flagged = rfUtils.boolValue(req.body.Flagged);
        } else {
            flagged = !r.data.Metapublication.Flagged;
        }

        if (!flagged) {
            if (req.User.Type !== constants.USER_TYPE_ADMIN) {
                // everyone can report copyright issue,
                // only admin can reset
                return rfUtils.error(
                    res,
                    httpStatus.FORBIDDEN,
                    constants.ERROR_FORBIDDEN,
                    constants.ERROR_MSG_FORBIDDEN
                );
            }
        }
        let q = 'UPDATE Metapublication SET Flagged = ? WHERE ID = ?';
        db.pool.query(q, [flagged, id], (err) => {
            if (err) {
                console.log('Failed to update Metapublication', err);
                return rfUtils.error(
                    res,
                    httpStatus.INTERNAL_SERVER_ERROR,
                    constants.ERROR_SQL,
                    'Failed to update Metapublication'
                );
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
 * Get statistics
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function getStatistics(req, res) {
    let _counters = {};

    getCounter('SELECT COUNT(*) FROM `Metapublication`').then((x) => {
        _counters.countMetapublications = x;
        return getCounter('SELECT COUNT(*) FROM `Metapublication` WHERE `Flagged` = 1');
    }).then((x) => {
        _counters.countMetapublicationsFlagged = x;
        return getCounter('SELECT COUNT(*) FROM `User`');
    }).then((x) => {
        _counters.countUsers = x;
        return getCounter('SELECT COUNT(*) FROM `Figure`');
    }).then((x) => {
        _counters.countFigures = x;
        return getCounter('SELECT SUM(`Count`) FROM `Visit`');
    }).then((x) => {
        _counters.countVisits = x;
        res.send({
            data: _counters
        });
    }).catch((e) => {
        console.log(e);
        return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, 'Failed to get statistics');
    });

    function getCounter(q) {
        return new Promise((resolve, reject) => {
            db.pool.query(q, (err, res) => {
                if (err) {
                    return reject(err);
                }
                let _rec = res[0];
                let _k = Object.keys(_rec)[0];
                resolve(_rec[_k]);
            });
        });
    }
}

function handleParsers(req, res, next) {
    if (
        req.headers['user-agent'] &&
        req.url.match(/collections\/item/) &&
        checkScrapperHeaders(req.headers['user-agent'])
    ) {
        let id = req.url.replace(/\//g, ' ').trim().split(' ').pop();
        get(id, (r) => {
            if (r.error) {
                return rfUtils.error(res, r.http, r.error, r.message);
            }
            let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            let body = [
                '<html>',
                    '<head lang="en">',
                        '<meta charset="UTF-8">',
                        '<meta name="og:url" content="' + fullUrl + '"/>',
                        '<meta name="og:type" content="website"/>'
            ];
            if (r.data) {
                body.push(
                        '<title>' + r.data.Metapublication.Title + '</title>',
                        '<meta name="og:title" content="' + (r.data.Metapublication.Title || 'No title') + '" />',
                        '<meta name="og:description" content="' + (r.data.Metapublication.Description || '') + '" />'
                );
                if (r.data.Metapublication.Figures[0]) {
                    body.push(
                        '<meta name="og:image" content="' + r.data.Metapublication.Figures[0].URL + '" />',
                        '<meta name="og:image:width" content="600"/>',
                        '<meta name="og:image:height" content="315"/>'
                    );
                }
            }
            body.push(
                    '</head>',
                '</html>'
            );
            res.status(200).send(body.join(''));
        });
    } else {
        next();
    }
}

function checkScrapperHeaders(userAgent) {
    return userAgent.match(/facebook/i) ||
        userAgent.match(/facebot/i) ||
        userAgent.match(/google/i);
}
