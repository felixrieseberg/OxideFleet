import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
    title: 'Sign In',
    // authenticator: 'simple-auth-authenticator:oauth2-password-grant',
    authenticator: 'authenticator:nitrogen',

    actions: {
        authenticateWithGoogle: function () {
            var self = this;

            this.get('session').authenticate('simple-auth-authenticator:torii', 'google-oauth2')
            .then(function () {
                self.transitionToRoute('dashboard');
            }, function (error) {
                console.log(error);
            });
        },

        authenticateWithFacebook: function() {
            var self = this;

            this.get('session').authenticate('simple-auth-authenticator:torii', 'facebook-oauth2')
            .then(function () {
                self.transitionToRoute('dashboard');
            }, function (error) {
                console.log(error);
            });
        },
    }
});
