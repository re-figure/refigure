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

    POPUP_ERROR_FIG_NOT_PARSED: 'Figure was not parsed',
    POPUP_ERROR_FIG_DUPLICATE: 'Figure is already selected'
};

// var _gApiURL = 'http://localhost:8181/api/';
var _gApiURL,
    permissions = chrome.runtime.getManifest().permissions;

for (var i=0; i < permissions.length; i++){
    if(permissions[i].match(/^http/)) {
        _gApiURL = permissions[i].replace(/\*$/,"");
        break;
    }
}

_gApiURL = _gApiURL || 'http://localhost:8181/api/';
