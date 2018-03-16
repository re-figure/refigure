/**
 * @ngdoc directive
 * @name refigureProfile.directive:dashboard
 * @restrict E
 * @description
 * Profile page
 * @example
 * <my-collections></my-collections>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('dashboard', {
            templateUrl: 'view/dashboard.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['collections', 'rfToast', '$http'];

    function Controller(collections, rfToast, $http) {
        var vm = this;

        vm.stats = null;

        vm.downloadsCSV = downloadsCSV;

        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:dashboard#activate
         * @methodOf refigureProfile.directive:dashboard
         * @description
         * Activates controller
         */
        function activate() {
            collections.statistics()
                .then(function (resp) {
                    vm.stats = resp;
                });
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:dashboard#downloadsCSV
         * @methodOf refigureProfile.directive:dashboard
         * @description
         * Get downloads and generate CSV file
         */
        function downloadsCSV() {
            return $http
                .get('/api/downloads')
                .then(function (res) {
                    var data = utils.get(res, 'data.data') || [];
                    if (!data.length) {
                        rfToast.show('Extension was not downloaded yet');
                    } else {
                        generateCSV(data);
                    }
                });
        }

        function generateCSV(data) {
            var csvArr = [];
            csvArr.push(
                '"' + Object.keys(data[0]).join('","') + '"'
            );
            data.forEach(function (obj) {
                csvArr.push(
                    '"' + Object.keys(obj).map(function (key) {
                        return obj[key];
                    }).join('","') + '"'
                );
            });
            var blob = new Blob([csvArr.join('\n')], {type: 'text/csv;charset=utf-8;'});
            var tempLink = document.createElement('a');
            tempLink.href = window.URL.createObjectURL(blob);
            tempLink.setAttribute('download', 'downloads.csv');
            tempLink.click();
        }

    }
})(window.angular);
