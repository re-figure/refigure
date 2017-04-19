/**
 * @ngdoc directive
 * @name refigureApp.directive:mostVisited
 * @restrict E
 * @description
 * Search Results
 * @example
 * <most-visited></most-visited>
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
        '$state',
        '$stateParams',
        'collections'
    ];

    function ItemController($state, $stateParams, collections) {
        var vm = this;
        var currentLastInRow = -1;

        vm.$onInit = activate;
        vm.refigure = {};
        vm.imageDetails = imageDetails;
        vm.details = {};

        ///////////////////////

        function activate() {
            //vm.elementsInRow = Math.floor(window.innerWidth / blockWidth);
            collections
                .get($stateParams.id)
                .then(function (resp) {
                    $state.current.data.headerTitle = '"' + resp.Title + '"';
                    vm.refigure = resp;
                });
        }

        function imageDetails(e, index) {
            var el = e.originalTarget,
                nextElement;
            if (el.tagName === 'IMG') {
                el = el.parentNode;
            }
            if (vm.details.ID === vm.refigure.Figures[index].ID) {
                //close current
                currentLastInRow = -1;
                vm.refigure.Figures[index].lastInRow = false;
                vm.details = {};
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
                        el.getBoundingClientRect().right >  nextElement.getBoundingClientRect().right //last in row
                    ) {
                        vm.refigure.Figures[currentLastInRow].lastInRow = true;
                        break;
                    }
                    currentLastInRow++;
                    el = el.nextElementSibling;
                }
                vm.details = vm.refigure.Figures[index];
            }

            function getNextImage (el) {
                var ret = el.nextElementSibling;
                if (ret && ret.tagName === 'MD-CARD') {
                    ret = ret.nextElementSibling;
                }
                return ret || el;
            }
        }

    }
})(window.angular);
