/**
 * @ngdoc object
 * @name refigureProfile
 * @description
 * Personal pages
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile', [
            'ui.router',
            'router.helper',
            'refigureShared'
        ])
        .constant('profileApiUri', '/api');

})(window.angular);
