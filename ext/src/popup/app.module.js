//fixme: debug page chrome-extension://eomljbidagegcimpgnpmmejnjbcfpdgo/popup/popup.html
//fixme: link to page where figure exists in database http://journals.plos.org/plosntds/article?id=10.1371/journal.pntd.0003013

(function (angular) {
    'use strict';

    var _store = {};
    var promises = [];

    promises.push(new Promise(function (resolve) {
        chrome.storage.local.get(null, function (data) {
            angular.extend(_store, data);
            resolve();
        });
    }));

    promises.push(new Promise(function (resolve) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (res) {
            _store.currentTab = res[0].id;
            //send message to force content's edit dialog close
            chrome.tabs.sendMessage(_store.currentTab, {
                type: _gConst.MSG_TYPE_POPUP_OPENED
            });

            //send to BG
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_GET_FOUND_FIGURES,
                tabId: _store.currentTab
            }, function (resp) {
                _store.foundFigures = resp.foundFigures || [];
                resolve();
            });
        });
    }));

    Promise.all(promises).then(function () {
        angular.bootstrap(document, ['ReFigure'], {strictDi: true})
    });

    angular.module('ReFigure', ['ngRoute'])
        .config(ConfigController);

    ConfigController.$inject = ['STORAGE', '$compileProvider'];

    function ConfigController(STORAGE, $compileProvider) {
        angular.extend(STORAGE, _store);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }


})(window.angular);
