import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';
import Config from '../config/environment';
import nitrogenEmberUtils from '../utils/nitrogen-ember-utils';

/**
Nitrogen Authenticator.

@class Nitrogen
@namespace SimpleAuth.Authenticators
@extends Base
*/
var nitrogenService = null;

export default Base.extend({
    init: function () {
        nitrogenService = new nitrogen.Service(Config.APP.nitrogen);
    },

    /**
    Restores the session from a set of session properties.
    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
    */
    restore: function (data) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            console.log('Nitrogen authenticator restore, with data: ', data);

            var principal = new nitrogen.User({
                accessToken: {
                    token: data.accessToken.token
                },
                id: data.user.id,
                nickname: data.user.nickname
            });

            nitrogenService.resume(principal, function (err, session, principal) {
                var store;

                if (err) { reject(err); }
                store = self.container.lookup('store:main');

                nitrogenEmberUtils.findOrCreateUser(store, session, principal)
                .then(function (storedUser) {
                    return nitrogenEmberUtils.updateOrCreateDevices(store, session, storedUser);
                }).then(function () {
                    var appController = self.container.lookup('controller:application');

                    console.log('Resolving Login', session);
                    appController.set('nitrogenSession', session);
                    resolve({ user: principal, accessToken: session.accessToken });
                });
            });
        });
    },

    /**
    Authenticates the session with the specified `credentials`.
    @method authenticate
    @param {Object} credentials The credentials to authenticate the session with
    @return {Ember.RSVP.Promise} A promise that resolves when an access token is successfully acquired from the server and rejects otherwise
    */
    authenticate: function (credentials) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            console.log('Nitrogen authenticator authenticate.');
            var user = new nitrogen.User({
                nickname: 'current',
                email: credentials.identification,
                password: credentials.password
            });
            Ember.run(function () {
                nitrogenService.authenticate(user, function (err, session, principal) {
                    var store;

                    if (err) { reject(err); }
                    store = self.container.lookup('store:main');

                    nitrogenEmberUtils.findOrCreateUser(store, session, principal)
                    .then(function (storedUser) {
                        return nitrogenEmberUtils.updateOrCreateDevices(store, session, storedUser);
                    }).then(function () {
                        var appController = self.container.lookup('controller:application');

                        console.log('Resolving Login', session);
                        appController.set('nitrogenSession', session);
                        resolve({ user: principal, accessToken: session.accessToken });
                    });
                });
            });
        });
    },

    /**
    Cancels any outstanding automatic token refreshes and returns a resolving promise.
    @method invalidate
    @param {Object} data The data of the session to be invalidated
    @return {Ember.RSVP.Promise} A resolving promise
    */
    invalidate: function () {
        return new Ember.RSVP.Promise(function (resolve) {
            console.log('Nitrogen authenticator invalidate.');
            nitrogenService = null;
            resolve({ user: null, accessToken: null });
        });
    }
});
