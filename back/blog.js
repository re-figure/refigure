const httpStatus = require('http-status-codes');

const constants = require('./const');
const db = require('./db');
const rfUtils = require('./rf-utils');
const vars = require('js.shared').vars;

exports.getAll = getAll;
exports.getSingle = getSingle;
exports.addOrUpdatePost = addOrUpdatePost;
exports.deletePost = deletePost;

function getAll(req, res) {
    db.pool.query({sql: `SELECT * FROM Blog ORDER BY DateCreated DESC`, nestTables:true}, [], (err, results) => {
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
    db.pool.query({sql: `SELECT * FROM Blog WHERE BlogID = ?`, nestTables:true}, [id], (err, results) => {
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

function addOrUpdatePost(req, res) {
    if (req.User.Type !== constants.USER_TYPE_ADMIN) {
        return rfUtils.error(
            res,
            httpStatus.FORBIDDEN,
            constants.ERROR_FORBIDDEN,
            constants.ERROR_MSG_FORBIDDEN
        );
    }
    let id = vars.get(req, 'BlogID');
    if (id) {
        updatePost(req, res);
    } else {
        createPost(req, res);
    }
}

function deletePost(req, res) {
    if (req.User.Type !== constants.USER_TYPE_ADMIN) {
        return rfUtils.error(
            res,
            httpStatus.FORBIDDEN,
            constants.ERROR_FORBIDDEN,
            constants.ERROR_MSG_FORBIDDEN
        );
    }
    let id = vars.get(req, 'BlogID');
    db.pool.query({sql: `SELECT BlogID FROM Blog WHERE BlogID = ?`}, [id], (err) => {
        if (err) {
            return res.send({
                http: httpStatus.INTERNAL_SERVER_ERROR,
                error: constants.ERROR_SQL,
                message: constants.ERROR_MSG_SQL
            });
        }
        /*db.pool.query('DELETE FROM Figure WHERE ID = ?', [id], (err) => {
            if (err) {
                console.log('Failed to delete post', err);
            }
            res.send(err);
        });*/
    });
}

function updatePost(req, res) {

}

function createPost(req, res) {

}