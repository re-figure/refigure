var _gConst = {
    STATUS_NEW: 0,
    STATUS_INPROCESS: 1,
    STATUS_COMPLETE: 2,

    MSG_TYPE_START_SEARCH: 0,
    MSG_TYPE_SEARCH_COMPLETED: 10,

    MSG_TYPE_IMAGE_ADD_START: 20,
    MSG_TYPE_REFIGURE_ADD_START: 21,
    MSG_TYPE_ADD_COMPLETED: 30,

    MSG_TYPE_USER_LOGGED_IN: 40,
    MSG_TYPE_USER_LOGGED_OUT: 50,
    MSG_TYPE_CHECK_COMPLETED: 60,
    MSG_TYPE_POPUP_OPENED: 70,
    MSG_TYPE_ADD_FIGURE_TO_COLLECTION: 80,
    MSG_TYPE_GET_FOUND_FIGURES: 90,

    MSG_TYPE_REFIGURE_IMAGES_COLLECTED: 100,

    POPUP_ERROR_FIG_NOT_PARSED: 'Image was not parsed',
    POPUP_ERROR_FIG_DUPLICATE: 'Image is already selected',

    ERROR_NOT_LOGGED: 'Please log in first.',
    FIGURE_ADDED: 'Figures were successfully added'

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
