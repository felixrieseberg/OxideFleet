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

function findOrCreateUser(store, session, principal, foundUser) {
    var newUser;
    if (foundUser == null) {
        newUser = store.createRecord('user', {
            id: 'me',
            name: principal.name,
            email: principal.email,
            api_key: principal.api_key,
            created_at: principal.created_at,
            nId: principal.id,
            last_connection: principal.last_connection,
            last_ip: principal.last_ip,
            nickname: principal.nickname,
            password: principal.password,
            updated_at: principal.updated_at
        });
        newUser.save();
        return newUser;
    } else {
        foundUser.set('name', principal.name);
        foundUser.set('email', principal.email);
        foundUser.set('api_key', principal.api_key);
        foundUser.set('created_at', principal.created_at);
        foundUser.set('nId', principal.id);
        foundUser.set('last_connection', principal.last_connection);
        foundUser.set('last_ip', principal.last_ip);
        foundUser.set('nickname', principal.nickname);
        foundUser.set('password', session.principal.password);
        foundUser.set('updated_at', principal.updated_at);

        foundUser.save();
        return foundUser;
    }
}

function updateDevice(foundDevice, device) {
    console.log("Found: " + device);
    foundDevice.set('id', device.id);
    foundDevice.set('name', device.name);
    foundDevice.set('lastUpdated', device.updated_at);
    foundDevice.save();
    return foundDevice;
}

function newDevice(store, device) {
    console.log("New Device: " + device);
    var nDevice = store.createRecord('device', {
        id: device.id,
        name: device.name,
        lastUpdated: device.updated_at
    });
    nDevice.save();
    return nDevice;
}

function updateOrCreateDevices(store, session) {
    nitrogen.Principal.find(session, {
        type: "device"
    }, {
        skip: 0,
        sort: { last_connection: 1 }
    }, function(err, principals) {
        var idx;
        for(idx = 0; idx < principals.length; ++idx) {
            store.find('device', { id: principals[idx].id })
            .then(function (foundDevice) { updateDevice(foundDevice, principals[idx]); }, newDevice(store, principals[idx]));
        }
    });   
}

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
            nitrogenService.resume(principal, function (err, session, principal) {
                var store, storedUser;

                if (err) { reject(err); }
                store = self.container.lookup('store:main');

                store.find('user', 'me')
                .then(function (foundUser) {
                    storedUser = findOrCreateUser(store, session, principal, foundUser);
                    console.log("restore found");
                    updateOrCreateDevices(store, session);
                    resolve({ user: principal, accessToken: session.accessToken });
                }, function () {
                    storedUser = findOrCreateUser(store, session, principal);
                    console.log("restore new");
                    updateOrCreateDevices(store, session);
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
                nitrogenService.authenticate(user, function (err, session, principal) {
                    var store, storedUser;

                    if (err) { reject(err); }
                    store = self.container.lookup('store:main');

                    store.find('user', { id: 'me' })
                    .then(function (foundUser) {
                        storedUser = findOrCreateUser(store, session, principal, foundUser);
                        console.log("auth found");
                        updateOrCreateDevices(store, session);
                        resolve({ user: principal, accessToken: session.accessToken });
                    }, function () {
                        storedUser = findOrCreateUser(store, session, principal);
                        console.log("auth new");
                        updateOrCreateDevices(store, session);
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
    invalidate: function() {
        return new Ember.RSVP.Promise(function(resolve) {
            console.log("Nitrogen authenticator invalidate.");
            nitrogenService = null;
            resolve({ user: null, accessToken: null });
        });
    }
});