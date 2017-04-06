'use strict';

const vars = require('js.shared').vars;
const utils = require('js.shared').utils;

const constants = require('./const.js');

exports.error = error;
exports.checkStringNotEmpty = checkStringNotEmpty;
exports.boolValue = boolValue;
exports.getUserName = getUserName;
exports.getObjectId = getObjectId;
exports.parseQuery = parseQuery;

/**
 * Check that given string is not empty
 * @param {string} s the string to check
 * @returns {boolean} true if the given string is define and is not null and has length
 */
function checkStringNotEmpty(s) {
    return (s && typeof s === 'string' && s.trim().length > 0);
}

/**
 * Send an error to the HTTP response
 * @param res   response
 * @param http  HTTP code (400, 401, 403, 409, 500, etc)
 * @param error extended code to be sent as {error:code}
 * @param message error message to be sent as {message:string}
 */
function error(res, http, error, message) {
    if (typeof http === 'undefined') {
        http = 500;
    }
    res
        .status(http)
        .send({
            error: error || http,
            message: message || constants.errorMessage(error)
        });
}

/**
 * Calculate boolean value
 * @param {string|number|boolean} s
 * @return {*}
 */
function boolValue(s) {
    if (s && typeof s === 'boolean') {
        return s;
    }
    if (s) {
        if (typeof s === 'number') {
            return s > 0;
        }
        if (typeof s === 'string') {
            return s.match(/true|yes|1|on/i);
        }
    }
    return false;
}


/**
 * Calculate full user name to be used in emails
 * @param {Object} user user info
 * @returns {string} - user name composed from first and last name or user's login
 */
function getUserName(user) {
    let name = user.Login;
    if (user.FirstName || user.LastName) {
        if (user.FirstName) {
            name = user.FirstName;
            if (user.LastName) {
                name += ' ' + user.LastName;
            }
        } else {
            name = user.LastName;
        }

    }
    return name;
}

/**
 * Extract object (User/Metapublication/Figure) ID from request
 * @param {Object} req
 * @param {Object} res
 * @returns {string} ID
 */
function getObjectId(req, res) {
    let id = vars.get(req, 'ID');
    if (!id) {
        throw {
            http: httpStatus.BAD_REQUEST,
            error: constants.ERROR_BADPARAMETERS,
            message : 'No ID provided'
        };
    }
    return id;
}

/**
 * Parse out search query from input parameters
 * @param {Object[]} tables - list of table descriptors to evaluate query parameters against
 * @param {Object<string, string>} params - input request parameters
 * @returns {CommonResponse} parsed query {Query} in data
 */
function parseQuery(tables, params) {
    /*jshint maxstatements:100 */
    /*jshint maxcomplexity:100 */
    let _query = {
        from: 0,
        size: constants.DEFAULT_PAGE_SIZE,
        sortDirection: constants.SORT_DIRECTION_ASCENDING,
        query: '',
        filters: []
    };

    if (!params) {
        return {data: _query};
    }
    // pagination
    if (utils.isset(params.from)) {
        let i = parseInt(params.from);
        if (!isNaN(i) && i > 0) {
            _query.from = i;
        }
    }
    if (utils.isset(params.size)) {
        let i = parseInt(params.size);
        if (!isNaN(i) && i > 0) {
            _query.size = i;
        }
    }

    // sorting
    // first, assume that sort order can be passed as
    // sort=column:order
    let _sortField = null;
    let _sortDirection = null;
    if (utils.isset(params.sort)) {
        let _re = new RegExp('^([^:]+):(' +
            constants.SORT_DIRECTION_ASCENDING + '|' +
            constants.SORT_DIRECTION_DESCENDING + ')$', 'i');
        let _m = String(params.sort).match(_re);
        if (_m) {
            _sortField = _m[1];
            _sortDirection = _m[2].toUpperCase();
        } else {
            _sortField = String(params.sort);
        }
    }
    if (!_sortField) {
        // just in case: have an ability to set sort field name
        // separately via sortField or sor_field parameter
        let _s = params.sortField || params['sort_field'];
        if (utils.isset(_s)) {
            _sortField = String(_s);
        }
    }
    if (_sortField) {
        _query.sortField = _sortField;
    }

    if (!_sortDirection) {
        let _s = params.sortDirection || params['sort_dir'] || params['dir'];
        if (utils.isset(_s)) {
            _s = String(_s);
            let _re = new RegExp('^' +
                constants.SORT_DIRECTION_ASCENDING + '|' +
                constants.SORT_DIRECTION_DESCENDING + '$', 'i');
            if (_s.match(_re)) {
                _sortDirection = _s.toUpperCase();
            }
        }
    }
    if (_sortDirection) {
        _query.sortDirection = _sortDirection;
    }

    // add main query
    if (utils.isset(params.query)) {
        _query.query = params.query;
    }

    // add filters
    if (tables) {
        tables.forEach((table) => {
            table.columns.forEach((column) => {
                let _f = table.name + '.' + column.name;
                let _lf = _f.toLowerCase();
                Object.keys(params).forEach((k) => {
                    if (k.toLowerCase() === _lf) {
                        if (typeof params[k] !== 'undefined') {
                            _query.filters.push({name: _f, value: params[k]});
                        }
                    }
                });
            });
        });
    }
    return {data: _query};
}
