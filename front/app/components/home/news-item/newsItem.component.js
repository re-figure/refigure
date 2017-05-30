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

    Controller.$inject = ['$stateParams', '$state', 'news'];

    function Controller($stateParams, $state, news) {
        var vm = this;

        vm.newsItem = {};
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
                $state.get('home.newsItem').data.headerTitle = data.HeaderTitle || data.Title;
                vm.newsItem = data;
            });
        }
    }
})(window.angular);
