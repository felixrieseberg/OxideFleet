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
        /**
         * Authenticates and displays an error if anything goes wrong
         */
        authenticate: function () {
            var self = this;
            this.set('loading', true);

            this._super().then(function () {
                Ember.Logger.debug('Session authentication succeeded');
            }, function (error) {
                self.set('loading', false);
                Ember.Logger.debug('Session authentication failed with message:', error.message);
                self.notify.warning({message: 'Incorrect email or password.', closeAfter: 7000});
            });
        },

        /**
         * Uses jQuery to programmitcally submit the login form
         */
        login: function () {
            Ember.$('#login').submit();
            return false;
        }
    }
});
