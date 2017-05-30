/**
 * @ngdoc directive
 * @name refigureApp.directive:news
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
        .component('news', {
            templateUrl: 'view/news.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['news'];

    function Controller(news) {
        var vm = this;

        vm.news = [];
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
            news.getAll().then(function (data) {
                vm.news = data;
            });
        }
    }
})(window.angular);
