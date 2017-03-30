(function (angular) {

    angular.module('ReFigure')
        .factory('MessageService', Controller);

    Controller.$inject = ['$timeout'];

    function Controller($timeout) {
        var exports = {
            loader: true,
            message: {
                text: '',
                type: ''
            },
            showMessage: showMessage
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
            $timeout(function () {
                exports.message.text = '';
            }, params.delay);
        }


    }

})(window.angular);
