/**
 * @ngdoc directive
 * @name refigureApp.directive:newsItem
 * @restrict E
 * @description
 * News Page
 * @example
 * <news></news>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('newsItem', {
            templateUrl: 'view/newsItem.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$stateParams', 'news'];

    function Controller($stateParams, news) {
        var vm = this;

        vm.item = {};
        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:news#activate
         * @methodOf refigureApp.directive:news
         * @description
         * Activates controller
         */
        function activate() {
            news.getSingle($stateParams.id).then(function (data) {
                vm.item = data;
            });
        }
    }
})(window.angular);
