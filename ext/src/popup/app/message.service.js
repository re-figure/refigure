(function (angular) {

    angular.module('ReFigure')
        .factory('MessageService', Controller);

    Controller.$inject = ['$timeout'];

    function Controller($timeout) {
        var exports = {
            loader: true,
            message: {
                text: '',
                type: '',
                show: false
            },
            window: {
                content: '',
                show: false
            },
            showMessage: showMessage,
            showWindow: showWindow
        };

        return exports;

        ////////////

        function showMessage(params) {
            params = angular.extend({
                text: '',
                delay: 3000,
                type: 'success'
            }, params);

            exports.message.text = params.text;
            exports.message.type = params.type;
            exports.message.show = true;
            $timeout(function () {
                exports.message.show = false;
            }, params.delay);
        }

        function showWindow(params) {
            params = angular.extend({
                content: ''
            }, params);
            exports.window.content = params.content;
            exports.window.show = true;
        }

    }

})(window.angular);
