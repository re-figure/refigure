/**
 * @ngdoc directive
 * @name refigureAuth.directive:signIn
 * @restrict E
 * @description
 * Sign in page
 * @example
 * <sign-in></sign-in>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .component('signIn', {
            templateUrl: 'view/signIn.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$scope',
        'auth',
        'GoogleSignin'
    ];

    function Controller($scope, auth, GoogleSignin) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.form = null;
        vm.data = {
            Email: '',
            Password: ''
        };

        vm.submit = submit;
        vm.withGoogle = withGoogle;
        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureAuth.controller:AuthSingInCtrl#activate
         * @methodOf refigureAuth.controller:AuthSingInCtrl
         * @description
         * Activates controller
         */
        function activate() {
            $scope.$on('ng-google-signin:isSignedIn', function (event, isSignedIn) {
                if (isSignedIn) {
                    auth
                        .oAuthGoogle(GoogleSignin.getUser().getAuthResponse().id_token)
                        .then(function (resp) {
                            console.log('resp', resp);
                        });
                }
            });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.controller:AuthSingInCtrl#submit
         * @methodOf refigureAuth.controller:AuthSingInCtrl
         * @description
         * Login
         */
        function submit() {
            vm.error = null;
            vm.loading = true;
            auth
                .login(vm.data)
                .then(function (res) {
                    auth.loadCurrentUrl();
                })
                .catch(function (res) {
                    vm.error = utils.get(res, ['data', 'message']);
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function withGoogle() {
            GoogleSignin.signIn().then(function (user) {
                console.log(user);
            }, function (err) {
                console.log(err);
            });
        }

        /*function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
                var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
                console.log('token', token);

                vm.authorizeButton = false;
                vm.signoutButton = true;
            } else {
                vm.authorizeButton = true;
                vm.signoutButton = false;
            }
            $scope.$apply();
        }

        function handleAuthClick() {
            gapi.auth2.getAuthInstance().signIn();
        }

        function handleSignoutClick() {
            gapi.auth2.getAuthInstance().signOut();
        }

        window.handleClientLoad = function () {
            // Load the API client and auth2 library
            gapi.load('client:auth2', function() {
                gapi.client.init({
                    apiKey: 'AIzaSyCnDKJt_n3eS3QtqLqcTkMu2vaCaguPCqU',
                    //discoveryDocs: discoveryDocs,
                    clientId: '604123564572-uuu98pul48vj6t2uqgu2epi8723egmli.apps.googleusercontent.com',
                    scope: 'profile email'
                }).then(function () {
                    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
                    // Handle the initial sign-in state.
                    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                });
            });
        };*/
    }

}(window.angular));
