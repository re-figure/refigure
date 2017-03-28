var _gConst = {
    STATUS_NEW: 0,
    STATUS_INPROCESS: 1,
    STATUS_COMPLETE: 2,

    MSG_TYPE_START_SEARCH: 0,
    MSG_TYPE_SEARCH_COMPLETED: 1,

    MSG_TYPE_ADD_START: 2,
    MSG_TYPE_ADD_COMPLETED: 3,

    MSG_TYPE_USER_LOGGED_IN: 4,
    MSG_TYPE_USER_LOGGED_OUT: 5,
    MSG_TYPE_CHECK_COMPLETED: 6,
    MSG_TYPE_CREATE_IN_POPUP: 7,
    MSG_TYPE_ADD_FIGURE_TO_COLLECTION: 8,

    POPUP_ERROR_FIG_NOT_PARSED: 'Figure was not parsed',
    POPUP_ERROR_FIG_DUPLICATE: 'Figure is already selected',

    ERROR_NOT_LOGGED: 'Please log in first.',
    FIGURE_ADDED: 'Figure was successfully added'

};

// var _gApiURL = 'http://localhost:8181/api/';
var _gApiURL;

(function () {
    var permissions = chrome.runtime.getManifest().permissions,
        i;
    for (i=0; i < permissions.length; i++){
        if(permissions[i].match(/^http/)) {
            _gApiURL = permissions[i].replace(/\*$/,"");
            break;
        }
    }

}());


_gApiURL = _gApiURL || 'https://localhost:8181/api/';
