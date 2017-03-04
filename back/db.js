'use strict';

const mysql = require('mysql');

const config = require('js.shared').config;
const pool = createPool();

exports.model = {
    ID: 'ID',
    TABLE_USER: 'User',
    TABLE_FIGURE: 'Figure'
};

exports.pool = pool;
exports.cbFind = cbFind;

/**
 * @name createPool
 * @returns {Object}
 * DB pool
 * @description
 * Creates MySQL Pool
 */
function createPool() {
    let dbConf = config.get('mysql');
    dbConf.multipleStatements = true;
    return mysql.createPool(dbConf);
}

/**
 * @name cbFind
 * @param   {String}    where Table name
 * @param   {Object}    by    Search by {col1:val1,col2:val2}
 * @param   {Function}  cb    Callback function.
 * @description
 * DB find in table by ... using AND
 * <pre>
 *     function callback(error, results, fields) {
 *      if (error) {
 *          console.error(error);
 *      } else {
 *          console.log(results, fields);
 *      }
 *     }
 * </pre>
 */
function cbFind(where, by, cb) {
    let q = 'SELECT * FROM ?? WHERE 1';
    let params = [];
    params.push(where);
    for (var key in by) {
        if (by.hasOwnProperty(key)) {
            q += ' AND ' + key + ' = ?';
            params.push(by[key]);
        }
    }
    pool.query(q, params, cb);
}