//debug page chrome-extension://eomljbidagegcimpgnpmmejnjbcfpdgo/popup/popup.html

(function () {
    'use strict';

    angular.module('ReFigure', ['ngRoute'])
        .config( [
            '$compileProvider',
            function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
            }
        ]);

})();
