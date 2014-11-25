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
            nitrogen_id: principal.id,
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
        foundUser.set('nitrogen_id', principal.id);
        foundUser.set('last_connection', principal.last_connection);
        foundUser.set('last_ip', principal.last_ip);
        foundUser.set('nickname', principal.nickname);
        foundUser.set('password', session.principal.password);
        foundUser.set('updated_at', principal.updated_at);

        foundUser.save();
        return foundUser;
    }
}

function updateDevice (foundDevice, device, owner) {
    console.log("Found: ", device);
    foundDevice.set('nitrogen_id', device.id);
    foundDevice.set('name', device.name);
    foundDevice.set('lastUpdated', device.updated_at);
    foundDevice.set('last_connection', device.last_connection);
    foundDevice.set('last_ip', device.last_ip);
    foundDevice.set('nickname', device.nickname);
    foundDevice.set('updated_at', device.updated_at);
    foundDevice.set('created_at', device.created_at);
    
    //foundDevice.set('owner', owner);
    foundDevice.save();
    return foundDevice;
}

function newDevice(store, device, owner) {
    console.log("New Device: ", device);
    var nDevice = store.createRecord('device', {
        nitrogen_id: device.id,
        name: device.name,
        lastUpdated: device.updated_at,
        last_connection: device.last_connection,
        last_ip: device.last_ip,
        nickname: device.nickname,
        created_at: device.created_at,
        updated_at: device.updated_at
    });

    nDevice.owner = owner;
    nDevice.save();
    return nDevice;
}

function lookupDevice (principal, user, store) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
        console.log('Looking up device with nid ' + principal.id);
        store.find('device', { nitrogen_id: principal.id })
        .then(function (foundDevices) {

            if (foundDevices.get('length') === 0) {
                return newDevice(store, principal, user);
            }

            if (foundDevices.get('length') > 1) {
                console.log('WARNING: Multiple devices in store for one Nitrogen id!');
                console.log('Number of devices in store for this id: ' + foundDevices.get('length'));
            }

            foundDevices.map(function (foundDevice) {
                updateDevice(foundDevice, principal, user); 
            });

            resolve();
        }, function () {
            return newDevice(store, principal, user);
            resolve();
        });
    });
}

function updateOrCreateDevices (store, session, user) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
        nitrogen.Principal.find(session, {
            type: "device"
        }, {
            skip: 0,
            sort: { last_connection: 1 }
        }, function (error, principals) {
            var principalLookup;

            if (error) {
                console.log(error);
                reject(error);
            }

            console.log(principals);

            principalLookup = principals.map(function (principal) {
                return lookupDevice(principal, user, store);
            });

            Ember.RSVP.all(principalLookup).then(function (results) {
                console.log('Principal Lookup Results: ', results);
                resolve();
            }).catch(function (error) {
                reject (error);
            });
        });
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
            console.log("Nitrogen authenticator restore, with data: ", data);

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
                    updateOrCreateDevices(store, session, storedUser).then(function() {
                        console.log('Resolving Login');
                        resolve({ user: principal, accessToken: session.accessToken });
                    });
                }, function () {
                    storedUser = findOrCreateUser(store, session, principal);
                    updateOrCreateDevices(store, session, storedUser).then(function() {
                        console.log('Resolving Login');
                        resolve({ user: principal, accessToken: session.accessToken });
                    });
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
                        updateOrCreateDevices(store, session, storedUser).then(function() {
                            console.log('Resolving Login');
                            resolve({ user: principal, accessToken: session.accessToken });
                        });
                    }, function () {
                        storedUser = findOrCreateUser(store, session, principal);
                        updateOrCreateDevices(store, session, storedUser).then(function() {
                            console.log('Resolving Login');
                            resolve({ user: principal, accessToken: session.accessToken });
                        });
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