/**
 * @ngdoc directive
 * @name refigureApp.directive:homePage
 * @restrict E
 * @description
 * Home Page
 * @example
 * <home-page></home-page>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('homePage', {
            templateUrl: 'view/homePage.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$state'
    ];

    function Controller($state) {
        var vm = this;
        vm.form = null;
        vm.searchTerm = '';
        vm.mostVisited = [{
            img: {
                src: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS2cfSsO7u34-I3IZmo7xan9CILgbkl9JvEaZI8ysjsHpPvTHoW'
            },
            title: 'Lorem ipsum dolor sit amet, quo et case noster, mel equidem deserunt in.'
        }, {
            img: {
                src: 'https://s-media-cache-ak0.pinimg.com/736x/82/2e/d9/822ed97e5704863d3c2a046e4e4e24af.jpg'
            },
            title: ' Wisi laboramus consectetuer id vis, ne eam timeam vidisse singulis, no vitae civibus ius.'
        }, {
            img: {
                src: 'https://s-media-cache-ak0.pinimg.com/originals/de/67/94/de6794d68644aebb8c8659d7aaaed58a.jpg'
            },
            title: 'Vix ne solum quando adolescens, omnes invidunt duo ne. Et maiorum salutandi vel, et ipsum ocurreret definitionem vis.'
        }];

        vm.submit = submit;

        activate();

        /////////////////////

        function activate() {

        }

        function submit() {
            $state.go('search-results', {
                term: vm.searchTerm
            });
        }
    }
})(window.angular);
