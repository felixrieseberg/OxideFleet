import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';
import Config from '../config/environment';

/**
Nitrogen Authenticator.

@class Nitrogen
@namespace SimpleAuth.Authenticators
@extends Base
*/
var nitrogenService = null;

export default Base.extend({
    init: function() {
        nitrogenService = new nitrogen.Service(Config.APP.nitrogen);
    },

    /**
    Restores the session from a set of session properties.
    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
    */
    restore: function(data) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            console.log("Nitrogen authenticator restore, with data: " + data);
            var principal = new nitrogen.User({
                accessToken: {
                    token: data.accessToken.token
                },
                id: data.user.id,
                nickname: data.user.nickname
            });
            nitrogenService.resume(principal, function (err, user) {
                if (err) { reject(err); }
                resolve({ user: user.principal, accessToken: user.accessToken });
            });
        });
    },

    /**
    Authenticates the session with the specified `credentials`.
    @method authenticate
    @param {Object} credentials The credentials to authenticate the session with
    @return {Ember.RSVP.Promise} A promise that resolves when an access token is successfully acquired from the server and rejects otherwise
    */
    authenticate: function(credentials) {
        var self = this;
        return new Ember.RSVP.Promise(function(resolve, reject) {
            console.log("Nitrogen authenticator authenticate.");
            var user = new nitrogen.User({
                nickname: 'current',
                email: credentials.identification,
                password: credentials.password
            });
            Ember.run(function () {
                nitrogenService.authenticate(user, function (err, user) {
                    var store, storedUser;

                    if (err) { reject(err); }

                    store = self.container.lookup('store:main');

                    store.find('user', { email: user.principal.email })
                    .then(function (foundUser) {
                        storedUser = foundUser;
                        resolve({ user: storedUser, accessToken: user.accessToken });
                    }, function () {

                        storedUser = store.createRecord('user', {
                            name: user.principal.name,
                            email: user.principal.email,
                            api_key: user.principal.api_key,
                            created_at: user.principal.created_at,
                            nId: user.principal.id,
                            last_connection: user.principal.last_connection,
                            last_ip: user.principal.last_ip,
                            nickname: user.principal.nickname,
                            password: user.principal.password,
                            updated_at: user.principal.updated_at
                        });

                        resolve({ user: storedUser, accessToken: user.accessToken });
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
    invalidate: function() {
        return new Ember.RSVP.Promise(function(resolve) {
            console.log("Nitrogen authenticator invalidate.");
            nitrogenService = null;
            resolve({ user: null, accessToken: null });
        });
    }
});