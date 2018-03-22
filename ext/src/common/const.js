var _gConst = {
    STATUS_NEW: 0,
    STATUS_INPROCESS: 1,
    STATUS_COMPLETE: 2,

    MSG_TYPE_START_SEARCH: 0,
    MSG_TYPE_SEARCH_COMPLETED: 10,

    MSG_TYPE_IMAGE_ADD_START: 20,
    MSG_TYPE_REFIGURE_ADD_START: 21,
    MSG_TYPE_ADD_COMPLETED: 30,

    MSG_TYPE_USER_LOGGED_IN_ON_SITE: 41,
    MSG_TYPE_USER_LOGGED_OUT_ON_SITE: 51,
    MSG_TYPE_CHECK_COMPLETED: 60,
    MSG_TYPE_POPUP_OPENED: 70,
    MSG_TYPE_ADD_FIGURE_TO_COLLECTION: 80,
    MSG_TYPE_GET_FOUND_FIGURES: 90,
    MSG_TYPE_BADGE_NA: 100,

    MSG_TYPE_REFIGURE_IMAGES_COLLECTED: 110,
    MSG_TYPE_IS_EXTENSION_INSTALLED: 120,

    POPUP_ERROR_FIG_NOT_PARSED: 'Image was not parsed',
    POPUP_ERROR_FIG_DUPLICATE: 'Image is already selected',

    ERROR_NOT_LOGGED: 'Please log in first.',
    FIGURE_ADDED: 'Figures were successfully added',

    SETTINGS: {
        parseAll: 'PARSE_ALL_SITES'
    },

    COOKIE: {
        // URL: 'http://localhost:8181',
        // DOMAIN: '.localhost:8181',
        URL: 'https://refigure.org',
        DOMAIN: '.refigure.org',
        NAME: 'Authentication'
    },

    ON_INSTALL: {
        LOG: '$LOG_ON_INSTALL$',
        EMAIL: '$EMAIL_ON_INSTALL$',
        FORCE_AUTH: '$FORCE_AUTH_ON_INSTALL$$'
    },
    ON_UNINSTALL: {
        LOG: '$LOG_ON_UNINSTALL$',
        EMAIL: '$EMAIL_ON_UNINSTALL$'
    },

    EXTENSION_USER_SOURCE_GOOGLE: 1
};

var _gApiURL;

(function () {
    var permissions = chrome.runtime.getManifest().permissions,
        i;
    for (i = 0; i < permissions.length; i++) {
        if (permissions[i].match(/^http/)) {
            _gApiURL = permissions[i].replace(/\*$/, '');
            break;
        }
    }

}());

_gApiURL = _gApiURL || 'https://localhost:8181/api/';
