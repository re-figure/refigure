/**
 * @ngdoc directive
 * @name refigureApp.directive:blogItem
 * @restrict E
 * @description
 * Single post
 * @example
 * <blog-item></blog-item>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('blogItem', {
            templateUrl: 'view/blogItem.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$stateParams', '$state', 'blog'];

    function Controller($stateParams, $state, blog) {
        var vm = this;

        vm.blogItem = {};
        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:blog#activate
         * @methodOf refigureApp.directive:blog
         * @description
         * Activates controller
         */
        function activate() {
            blog.getSingle($stateParams.id).then(function (data) {
                $state.get('home.blogItem').data.headerTitle = data.HeaderTitle || data.Title;
                vm.blogItem = data;
            });
        }
    }
})(window.angular);
