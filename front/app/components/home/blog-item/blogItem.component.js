/**
 * @ngdoc directive
 * @name refigureApp.directive:blogItem
 * @restrict E
 * @description
 * Single post
 * @example
 * <blog-item></blog-item>
 */
(function(angular, twttr) {
    'use strict';

    angular
        .module('refigureApp')
        .component('blogItem', {
            templateUrl: 'view/blogItem.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$location', '$state', 'blog'];

    function Controller($location, $state, blog) {
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
            blog.getSingle($state.params.id).then(function (data) {
                $state.get('home.blogItem').data.headerTitle = data.HeaderTitle || data.Title;
                vm.blogItem = data;
                twttr.widgets.createShareButton(
                    $location.absUrl(),
                    document.getElementById('twitter-share'),
                    {
                        size: 'large',
                        url: $location.absUrl(),
                        text: data.Title,
                        via: 'scimpact_org',
                        related: 'twitterapi,twitter'
                    }
                );
            });
            twttr.widgets.createTimeline(
                {
                    sourceType: 'profile',
                    screenName: 'scimpact_org'
                },
                document.getElementById('twitter-feed'),
                {
                    height: 1000
                }
            );
        }
    }
})(window.angular, window.twttr);
