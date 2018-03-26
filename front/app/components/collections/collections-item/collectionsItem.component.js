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
        '$location',
        '$state',
        '$mdMedia',
        'MESSAGES',
        'collections',
        'modalDialog',
        'auth',
        'CONST'
    ];

    function ItemController($scope, $location, $state, $mdMedia, MESSAGES, collections, modal, auth, CONST) {
        var vm = this;
        var currentLastInRow = -1;

        var _imgSrcParsers = [{
            name: 'plos',
            matcher: function (str) {
                return str.match(/plos\.org/);
            },
            replacer: function (str) {
                return str.replace('size=inline', 'size=large');
            }
        }, {
            name: 'elifescinces',
            matcher: function (str) {
                return str.match(/elifesciences\.org/);
            },
            replacer: function (str) {
                return str.replace('-480w.', '.').replace('-300w.', '.');
            }
        }, {
            name: 'pmc (report)',
            matcher: function (str) {
                return str.match(/ncbi\.nlm\.nih\.gov\/pmc/) && str.indexOf('?report=thumb') !== -1;
            },
            replacer: function (str) {
                return str.replace('report=thumb', 'report=previmg');
            }
        }, {
            name: 'pmc (ext)',
            matcher: function (str) {
                return str.match(/ncbi\.nlm\.nih\.gov\/pmc/);
            },
            replacer: function (str) {
                return str.replace('.gif', '.jpg');
            }
        }];

        vm.layout = {
            grid: {
                thumbFlex: 33,
                itemFlex: 100
            },
            masonry: {
                thumbFlex: 100,
                itemFlex: 50
            }
        };

        vm.refigure = {};
        vm.details = null;
        vm.user = {};

        vm.imageDetails = imageDetails;
        vm.toggleFlag = toggleFlag;
        vm.isAdmin = isAdmin;
        vm.showFullScreen = showFullScreen;
        vm.showProperties = showProperties;

        vm.$onInit = activate;

        ///////////////////////

        function activate() {
            vm.url = $location.absUrl();
            $scope.$watch(function () {
                return $state.params.view;
            }, function (view) {
                //only grid view on small devices
                vm.view = !$mdMedia('gt-sm') || !view ? 'grid' : view;
            });

            if (auth.isAuthenticated()) {
                auth.usrInfo().then(function (user) {
                    vm.user = user;
                });
            }
            $scope.$on('refigureUpdated', function (e, updated) {
                e.stopPropagation();
                setRefigure(updated);
            });

            $state.get('collections.item').data.headerTitle = '';
            collections
                .get($state.params.id)
                .then(function (resp) {
                    if (CONST.parseRefigureSite) {
                        window.postMessage({
                            type: MESSAGES.MSG_TYPE_REFIGURE_IMAGES_COLLECTED,
                            images: resp.Figures
                        }, '*');
                    }
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
                clickOutsideToClose: true,
                parent: document.getElementById('#r-page-content')
            });
        }

        function showProperties(e, image) {
            modal.show({
                controller: angular.noop,
                bindToController: true,
                controllerAs: 'vm',
                locals: {
                    image: image
                },
                templateUrl: 'view/imageProperties.modal.html',
                targetEvent: e,
                clickOutsideToClose: true,
                parent: document.getElementById('#r-page-content')
            });
        }

        function setRefigure(refigure) {
            angular.merge(vm.refigure, refigure);
            vm.refigure.Figures = refigure.Figures;
            $state.get('collections.item').data.headerTitle = '"' + vm.refigure['Title'] + '"';
            var shouldPreload = $mdMedia('gt-sm');
            vm.refigure.Figures.forEach(function (fig) {
                for (var i = 0; i < _imgSrcParsers.length; i++) {
                    if (_imgSrcParsers[i].matcher(fig.URL)) {
                        var largeSRC = _imgSrcParsers[i].replacer(fig.URL);
                        console.info('URL "', fig.URL, '" matches ', _imgSrcParsers[i].name, '. Preloading ', largeSRC);
                        if (shouldPreload) {
                            preloadAndReplace(fig, largeSRC);
                        }
                        break;
                    }
                }
            });
        }

        function preloadAndReplace(figure, largeSrc) {
            var img = new Image();
            img.onload = function () {
                $scope.$applyAsync(function () {
                    figure.URL = largeSrc;
                });
            };
            img.src = largeSrc;
        }

    }
})(window.angular);
