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
        var self = this;
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
                var store, storedUser;

                if (err) { reject(err); }

                store = self.container.lookup('store:main');

                store.find('user', 'me')
                .then(function (foundUser) {
                    foundUser.set('name', user.principal.name);
                    foundUser.set('email', user.principal.email);
                    foundUser.set('api_key', user.principal.api_key);
                    foundUser.set('created_at', user.principal.created_at);
                    foundUser.set('nId', user.principal.id);
                    foundUser.set('last_connection', user.principal.last_connection);
                    foundUser.set('last_ip', user.principal.last_ip);
                    foundUser.set('nickname', user.principal.nickname);
                    foundUser.set('password', user.principal.password);
                    foundUser.set('updated_at', user.principal.updated_at);

                    foundUser.save();
                    resolve({ user: user.principal.email, accessToken: user.accessToken });
                }, function () {

                    storedUser = store.createRecord('user', {
                        id: 'me',
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
                    storedUser.save();

                    resolve({ user: user.principal.email, accessToken: user.accessToken });
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

                    store.find('user', { id: 'me' })
                    .then(function (foundUser) {
                        foundUser.set('name', user.principal.name);
                        foundUser.set('email', user.principal.email);
                        foundUser.set('api_key', user.principal.api_key);
                        foundUser.set('created_at', user.principal.created_at);
                        foundUser.set('nId', user.principal.id);
                        foundUser.set('last_connection', user.principal.last_connection);
                        foundUser.set('last_ip', user.principal.last_ip);
                        foundUser.set('nickname', user.principal.nickname);
                        foundUser.set('password', user.principal.password);
                        foundUser.set('updated_at', user.principal.updated_at);

                        foundUser.save();
                        resolve({ user: user.principal.email, accessToken: user.accessToken });
                    }, function () {

                        storedUser = store.createRecord('user', {
                            id: 'me',
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
                        storedUser.save();

                        resolve({ user: user.principal.email, accessToken: user.accessToken });
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