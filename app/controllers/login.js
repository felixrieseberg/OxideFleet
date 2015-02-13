import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
    title: 'Sign In',
    authenticator: 'authenticator:nitrogen',
    loading: false,

    init: function () {
        this._super();
        this.set('loading', false);
    },

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

        authenticateWithFacebook: function () {
            var self = this;

            this.get('session').authenticate('simple-auth-authenticator:torii', 'facebook-oauth2')
                .then(function () {
                    self.transitionToRoute('dashboard');
                }, function (error) {
                    console.log(error);
                });
        },

        // display an error when authentication fails
        authenticate: function () {
            var self = this;
            this.set('loading', true);

            this._super().then(function () {
                Ember.Logger.debug('Session authentication succeeded');
            }, function (error) {
                this.set('loading', false);
                Ember.Logger.debug('Session authentication failed with message:', error.message);
                self.notify.warning({message: 'Incorrect email or password.', closeAfter: 7000});
            });
        }
    }
});
