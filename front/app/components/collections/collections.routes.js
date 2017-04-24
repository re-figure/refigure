/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .run(appRun);

    var states = [{
        state: 'collections.item',
        config: {
            url: '/collections/item/:id',
            template: '<collections-item></collections-item>',
            data: {}
        }
    }, {
        state: 'collections.user',
        config: {
            url: '/collections/user?{from:int}&query&{size:int}&sortDirection&sortField',
            template: '<collections-user></collections-user>',
            reloadOnSearch: false,
            data: {}
        }
    }];

    appRun.$inject = [
        'routerHelper'
    ];

    function appRun(routerHelper) {

        routerHelper.trailingSlash();
        routerHelper.configureStates(getStates(), '/');

        //////////////////////

        function getStates() {
            return [{
                state: 'collections',
                config: {
                    abstract: true,
                    templateUrl: 'view/collections.html'
                }
            }]
                .concat(states);
        }
    }
})(window.angular);
