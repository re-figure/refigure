'use strict';

const httpStatus = require('http-status-codes');

const utils = require('js.shared').utils;
const vars = require('js.shared').vars;

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');

exports.getMetapublication = getMetapublication;
exports.arrangeVisitRecord = arrangeVisitRecord;
exports.arrangeUserRecord = arrangeUserRecord;
exports.mostVisited = mostVisited;
exports.myMetapublications = myMetapublications;
exports.search = search;

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
 * @param rec
 * @param id
 */
function arrangeVisitRecord(rec, id) {
    let r = {
        Count: 0,
        MetapublicationID : id
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
 * Get metapubliucation by its ID with related data - figures, visits counter
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function getMetapublication(req, res) {
    let id = rfUtils.getObjectId(req, res);
    db.pool.query({sql: `
        SELECT *
          FROM Metapublication
          JOIN User ON User.ID = Metapublication.UserID          
          LEFT JOIN Visit ON Visit.MetapublicationID = Metapublication.ID
    `, nestTables: true}, [id], (err, results) => {
        if (err) {
            console.log(err);
            return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
        }
        if (results.length === 0) {
            return rfUtils.error(res, httpStatus.NOT_FOUND, constants.ERROR_SQLNOTFOUND, 'No Metapublication found');
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
                return rfUtils.error(res, httpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_SQL, constants.ERROR_MSG_SQL);
            }
            rec.Metapublication.Figures = [];
            for (let r of results) {
                r.Figure.User = arrangeUserRecord(r.User);
                rec.Metapublication.Figures.push(r.Figure);
            }
            let novisit = vars.get(req, 'novisit');
            if (rfUtils.boolValue(novisit)) {
                res.send({
                    data: rec
                });
            } else {
                db.pool.query(`
                    INSERT INTO Visit (MetapublicationID, Count) VALUES (?, 1) ON DUPLICATE KEY UPDATE Count = Count + 1
                `, [rec.Metapublication.ID], (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.send({
                        data: rec
                    });
                });
            }
        });
    });
}

/**
 * Get list of most visited metapublications (with first figure) up to 'limit'
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function mostVisited(req, res) {
    let limit = vars.get(req, 'limit');
    if (!(typeof(limit) === typeof(Number) && limit > 0 && limit <= constants.MAX_RESULTS)) {
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
    db.pool.query({sql: `
        SELECT *, 
         (SELECT COUNT(*) FROM Figure WHERE Figure.MetapublicationID = Metapublication.ID) AS FiguresCount
          FROM Metapublication
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
          ORDER BY Metapublication.Title
    `, nestTables: true}, [req.User.ID], (err, results) => {
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
                x.Metapublication.User = arrangeUserRecord(req.User);
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
 * Search metapublications
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 */
function search(req, res) {
    let r = rfUtils.parseQuery(undefined, req.query);
    if (r.error) {
        return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, constants.ERROR_MSG_BADPARAMETERS);
    }
    let query = r.data;

    let params = [];
    let q = `
        SELECT SQL_CALC_FOUND_ROWS *, 
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
        q += `
            WHERE Metapublication.ID IN (
			          SELECT DISTINCT MetapublicationID
                        FROM FullTextSearch
			           WHERE MATCH(Value) AGAINST (?)
                 )
        `;
        params.push(query.query);
    }
    if (query.sortField) {
        let valid = false;
        for (let f of ['Visit.Count', 'FiguresCount', 'Metapublication.Title']) {
            valid = true;
            break;
        }
        if (!valid) {
            return rfUtils.error(res, httpStatus.BAD_REQUEST, constants.ERROR_BADPARAMETERS, 'Wrong sort provided');
        }
        q += ' ORDER BY ? ' + query.sortDirection;
        params.push(query.sortField);
    } else {
        q += ' ORDER BY Visit.Count DESC';

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