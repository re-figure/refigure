// Constants
'use strict';

/**
 * Error/Data object
 * @typedef {Object} CommonResponse
 * @property {number?} error - an error code if set and > 0
 * @property {string?} message - corresponding error message
 * @property {Object?} data - data if error === 0 or is not set
 */

/**
 * The common operation callback
 * @callback CommonCallback
 * @param {CommonResponse} response
 */

var _gConst = {

    //user types
    USER_TYPE_NOTCONFIRMED: 0, // user is already registered but has not confirmed registration yet
    USER_TYPE_CUSTOMER: 1,     // regular customer
    USER_TYPE_ADMIN: 2,        // admin user

    USER_TYPE_TEMPORARY: 10,   // a temporary user

    USER_REGISTRATION_TYPE_PASSWORD: 0,
    USER_REGISTRATION_TYPE_GOOGLE: 1,
    USER_REGISTRATION_TYPE_FACEBOOK: 2,

    EXTENSION_USER_SOURCE_GOOGLE: 1,

    // authentication header name
    AUTHENTICATION_HEADER: 'Authentication',
    AUTHENTICATION_COOKIE: 'Authentication',

    // cookie to store last captcha
    CAPTCHA_COOKIE: 'refigure',

    // other constants
    MAX_RESULTS: 20,
    DEFAULT_MOST_VISITED_LIMIT: 3,

    // query parameters
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 1000,
    SORT_DIRECTION_ASCENDING: 'ASC',
    SORT_DIRECTION_DESCENDING: 'DESC',

    // error messages
    // 400 BAD PARAMETERS
    ERROR_NOCAPTCHA: 40001, // no captcha text provided in the captcha validation request

    ERROR_WRONGCAPTCHA: 40002, // wrong captcha text

    ERROR_BADPARAMETERS: 40003, // bad or missed parameters (no json object provided in POST request)
    ERROR_MSG_BADPARAMETERS: 'Bad or missed parameters',

    ERROR_WEAKPASSWORD: 40006, // the checked password is too weak and does ot conform password strength requirements
    ERROR_MSG_WEAKPASWORD: 'Provided password is too weak',

    // 401 UNAUTHORIZED
    ERROR_NOSECTOKEN: 40100, // no security token provided
    ERROR_MSG_NOSECTOKEN: 'You are unauthorized',

    ERROR_NOREGISTRATIONTOKEN: 40101, // no registration token provided
    ERROR_MSG_NOREGISTRATIONTOKEN: 'Invalid registration token provided - unable to complete registration',

    ERROR_REGISTRATIONALREADYCOMPLETED: 40102, // registration has already completed
    ERROR_MSG_REGISTRATIONALREADYCOMPLETED: 'Registration has been already completed. Please login',

    ERROR_PASSWORDCHANGENOTPERMITTED: 40103,
    ERROR_MSG_PASSWORDCHANGENOTPERMITTED: 'You are not authorized to change password',

    ERROR_SOCIAL_REJECT: 40104,     //oauth access token validation error

    // 404 NOT FOUND
    ERROR_SQLNOTFOUND: 40400,  // SQL not found

    ERROR_USERNOTFOUND: 40401, // user with the given login/email and password is not found
    ERROR_MSG_USERNOTFOUND: 'Invalid user name or password',

    ERROR_FILENOTFOUND: 40402, // requested file is not found
    ERROR_MSG_FILENOTFOUND: 'File not found',

    ERROR_FORBIDDEN: 40301, // user has no access to the requested data
    ERROR_MSG_FORBIDDEN: 'Access denied',

    ERROR_USERNOTREGISTERED: 40402, // user has not completed the registration yet
    ERROR_MSG_USERNOTREGISTERED: 'Account is not active yet, please complete registration first',

    // 409 CONFLICT
    ERROR_USERALREADYEXISTS: 40901, // such user (with same login or email) already exists
    ERROR_MSG_USERALREADYEXISTS: 'Account with such login or email already exists',

    ERROR_SETALREADYEXISTS: 40902, // such set with the given label already already exists within the order
    ERROR_MSG_SETALREADYEXISTS: 'The set with this label already exists',

    ERROR_SAMPLEALREADYEXISTS: 40903, // such sample with the given label already already exists within the set
    ERROR_MSG_SAMPLEALREADYEXISTS: 'The sample with this label already exists',

    ERROR_NOSPACEINPPLATE: 40904, // such sample with the given label already already exists within the set
    ERROR_MSG_NOSPACEINPPLATE: 'The plate has no space to put the whole set in',

    // 500 INTERNAL ERROR
    ERROR_SQL: 50001, // an SQL error occurred
    ERROR_MSG_SQL: 'An SQL error occurred',

    ERROR_EMAIL: 50003, // email error
    ERROR_EXCEL: 50004, // Excel error
    ERROR_FILE: 50005, // file errors

    /**
     * Returns error message by error code
     * @param {String} errorCode
     * @returns {String} Error message
     */
    errorMessage: function (errorCode) {
        let _code;
        for (let _c in this) {
            if (this.hasOwnProperty(_c) && this[_c] === errorCode) {
                _code = _c.replace(/ERROR_(.+)/, 'ERROR_MSG_$1');
                break;
            }
        }
        if (_code && this.hasOwnProperty(_code)) {
            return this[_code];
        }
        return 'An error occurred';
    },

    FULLTEXT_SEARCH_FIELDS: ['Metapublication.Keywords']
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = _gConst;
}
