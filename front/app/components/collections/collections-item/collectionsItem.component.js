/**
 * @ngdoc directive
 * @name refigureApp.directive:collectionsItem
 * @restrict E
 * @description
 * Single collection page
 * @example
 * <collections-item></collections-item>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('collectionsItem', {
            templateUrl: 'view/collectionsItem.component.html',
            controllerAs: 'vm',
            controller: ItemController
        });

    ItemController.$inject = [
        '$scope',
        '$state',
        '$stateParams',
        'collections',
        'modalDialog',
        'auth'
    ];

    function ItemController($scope, $state, $stateParams, collections, modal, auth) {
        var vm = this;
        var currentLastInRow = -1;

        vm.refigure = {};
        vm.details = null;
        vm.user = {};

        vm.imageDetails = imageDetails;
        vm.toggleFlag = toggleFlag;
        vm.isAdmin = isAdmin;
        vm.showFullScreen = showFullScreen;

        vm.$onInit = activate;

        ///////////////////////

        function activate() {
            auth.usrInfo().then(function (user) {
                vm.user = user;
            });
            $scope.$on('refigureUpdated', function (e, updated) {
                e.stopPropagation();
                setRefigure(updated);
            });

            $state.get('collections.item').data.headerTitle = '';
            collections
                .get($stateParams.id)
                .then(function (resp) {
                    setRefigure(resp);
                });
        }

        function imageDetails(e, index) {
            var el = e.target,
                nextElement;
            if (el.tagName === 'IMG') {
                el = el.parentNode;
            }
            if (vm.details && vm.details.ID === vm.refigure.Figures[index].ID) {
                //close current
                currentLastInRow = -1;
                vm.refigure.Figures[index].lastInRow = false;
                vm.details = null;
            } else {
                if (currentLastInRow !== -1) {
                    //close previously opened
                    vm.refigure.Figures[currentLastInRow].lastInRow = false;
                }
                //search for last in row
                currentLastInRow = index;
                while (el) {
                    nextElement = getNextImage(el);
                    if (
                        currentLastInRow === vm.refigure.Figures.length - 1 || //is last element
                        el.getBoundingClientRect().right > nextElement.getBoundingClientRect().right //last in row
                    ) {
                        vm.refigure.Figures[currentLastInRow].lastInRow = true;
                        break;
                    }
                    currentLastInRow++;
                    el = el.nextElementSibling;
                }
                vm.details = vm.refigure.Figures[index];
            }

            function getNextImage(el) {
                var ret = el.nextElementSibling;
                if (ret && ret.tagName === 'MD-CARD') {
                    ret = ret.nextElementSibling;
                }
                return ret || el;
            }
        }

        function toggleFlag() {
            collections.toggleFlag(vm.refigure.ID)
                .then(function () {
                    vm.refigure.Flagged = !vm.refigure.Flagged * 1;
                });
        }

        function isAdmin() {
            return vm.user.Type === 2;
        }

        function showFullScreen(e, src) {
            modal.show({
                template: '<img src="' + src + '">',
                targetEvent: e,
                clickOutsideToClose:true,
                fullscreen: true
            });
        }

        function setRefigure(refigure) {
            angular.merge(vm.refigure, refigure);
            $state.get('collections.item').data.headerTitle = '"' + vm.refigure.Title + '"';
            if (vm.refigure.Keywords) {
                vm.refigure.KeywordsChips = vm.refigure.Keywords.split(/(?:(?:&[^;]+;)|\s|\||,|;)+/);
            }
        }

    }
})(window.angular);
