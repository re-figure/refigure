(function (angular) {

    angular.module('ReFigure')
        .factory('FoundFiguresService', Controller);

    Controller.$inject = [];

    function Controller() {
        let exports = {
            isOpened: false,
            toggle: function () {
                exports.isOpened = !exports.isOpened;
            }
        };
        return exports;
    }

})(window.angular);
