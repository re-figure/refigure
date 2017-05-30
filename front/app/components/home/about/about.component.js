/**
 * @ngdoc directive
 * @name refigureApp.directive:about
 * @restrict E
 * @description
 * About Page
 * @example
 * <about></about>
 */
(function(angular, twttr) {
    'use strict';

    angular
        .module('refigureApp')
        .component('about', {
            templateUrl: 'view/about.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [];

    function Controller() {
        var vm = this;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:about#activate
         * @methodOf refigureApp.directive:about
         * @description
         * Activates controller
         */
        function activate() {
            twttr.widgets.createTimeline(
                {
                    sourceType: 'profile',
                    screenName: 'scimpact_org'
                },
                document.getElementById('twitter-feed'),
                {
                    height: 470
                }
            );
        }
    }
})(window.angular, window.twttr);
