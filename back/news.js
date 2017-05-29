const httpStatus = require('http-status-codes');

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');
const vars = require('js.shared').vars;
const uuid = require('node-uuid');

exports.getAll = getAll;
exports.getSingle = getSingle;
exports.addOrUpdateNews = addOrUpdateNews;
exports.deleteNews = deleteNews;

function getAll(req, res) {
    db.pool.query({sql: `
            SELECT NewsID, Title, DateCreated, Author
            FROM News
            ORDER BY DateCreated DESC
        `, nestTables:true}, [], (err, results) => {
        if (err) {
            return res.send({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        res.send({
            data: results
        });
    });
}

function getSingle(req, res) {
    let id = vars.get(req, 'ID');
    db.pool.query({sql: `SELECT * FROM News WHERE NewsID = ?`, nestTables:true}, [id], (err, results) => {
        if (err) {
            return res.send({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        res.send({
            data: results.length ? results[0] : []
        });
    });
}

function addOrUpdateNews(req, res) {
    if (req.User.Type !== constants.USER_TYPE_ADMIN) {
        return rfUtils.error(
            res,
            httpStatus.FORBIDDEN,
            constants.ERROR_FORBIDDEN,
            constants.ERROR_MSG_FORBIDDEN
        );
    }
    let id = vars.get(req, 'NewsID');
    if (id) {
        updateNews(req, res);
    } else {
        createNews(req, res);
    }
}

function deleteNews(req, res) {
    if (req.User.Type !== constants.USER_TYPE_ADMIN) {
        return rfUtils.error(
            res,
            httpStatus.FORBIDDEN,
            constants.ERROR_FORBIDDEN,
            constants.ERROR_MSG_FORBIDDEN
        );
    }
    let id = vars.get(req, 'NewsID');
    db.pool.query({sql: `SELECT NewsID FROM News WHERE NewsID = ?`}, [id], (err) => {
        if (err) {
            return res.send({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        db.pool.query('DELETE FROM Figure WHERE ID = ?', [id], (err) => {
            if (err) {
                console.log('Failed to delete news', err);
            }
            res.send(err);
        });
    });
}

function updateNews(req, res) {

}

function createNews(req, res) {

}