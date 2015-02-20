import Ember from 'ember';

var nitrogenEmberUtils = {
    findOrCreateUser: function (store, session, principal) {
        return new Ember.RSVP.Promise(function (resolve) {
            store.find('user', {
                id: 'me'
            }).then(function (foundUser) {
                if (foundUser.content.length > 0) {
                    foundUser = foundUser.content[0];

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

                    foundUser.save().then(function (result) {
                        resolve(result);
                    });
                }
            }, function (reason) {
                console.log(reason);

                var user = store.createRecord('user', {
                    id: 'me'
                });
                user.set('name', principal.name);
                user.set('email', principal.email);
                user.set('api_key', principal.api_key);
                user.set('created_at', principal.created_at);
                user.set('nitrogen_id', principal.id);
                user.set('last_connection', principal.last_connection);
                user.set('last_ip', principal.last_ip);
                user.set('nickname', principal.nickname);
                user.set('password', session.principal.password);
                user.set('updated_at', principal.updated_at);

                user.save().then(function (result) {
                    resolve(result);
                });
            });
        });
    },

    updateDevice: function (foundDevice, device, owner) {
        foundDevice.set('nitrogen_id', device.id);
        foundDevice.set('name', device.name);
        foundDevice.set('lastUpdated', device.updated_at);
        foundDevice.set('last_connection', device.last_connection);
        foundDevice.set('last_ip', device.last_ip);
        foundDevice.set('nickname', device.nickname);
        foundDevice.set('updated_at', device.updated_at);
        foundDevice.set('created_at', device.created_at);
        foundDevice.set('tags', device.tags);
        foundDevice.set('type', device.type);
        foundDevice.set('location', device.location);
        foundDevice.set('owner', owner);

        return foundDevice.save();
    },

    newDevice: function (store, device, owner) {
        var newDevice = store.createRecord('device', {
            nitrogen_id: device.id,
            name: device.name,
            lastUpdated: device.updated_at,
            last_connection: device.last_connection,
            last_ip: device.last_ip,
            nickname: device.nickname,
            created_at: device.created_at,
            updated_at: device.updated_at,
            tags: device.tags,
            type: device.type,
            location: device.location,
            owner: owner
        });

        return newDevice.save();
    },

    removeDevices: function (principals, store) {
        return new Ember.RSVP.Promise(function (resolve) {
            var principalIds = [];

            for (let i = 0; i < principals.length; i += 1) {
                principalIds.push(principals[i].id);
            }

            store.find('device').then(function (foundDevices) {
                if (foundDevices.content.length < 1) {
                    return resolve();
                }

                for (let i = 0; i < foundDevices.content.length; i += 1) {
                    if (principalIds.indexOf(foundDevices.content[i].get('nitrogen_id')) === -1) {
                        foundDevices.content[i].destroyRecord();
                    }
                }

                resolve();
            });
        });
    },

    lookupDevice: function (principal, user, store) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve) {
            store.find('device', {
                    nitrogen_id: principal.id
                })
                .then(function (foundDevices) {
                    if (foundDevices.get('length') === 0) {
                        return self.newDevice(store, principal, user);
                    }

                    if (foundDevices.get('length') > 1) {
                        console.log('WARNING: Multiple devices in store for one Nitrogen id!');
                        console.log('Number of devices in store for this id: ' + foundDevices.get('length'));
                    }

                    foundDevices.map(function (foundDevice) {
                        self.updateDevice(foundDevice, principal, user);
                    });

                    resolve();
                }, function () {
                    resolve(self.newDevice(store, principal, user));
                });
        });
    },

    updateOrCreateDevices: function (store, session, user) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve, reject) {
            nitrogen.Principal.find(session, {
                type: 'device'
            }, {
                skip: 0,
                sort: {
                    last_connection: 1
                }
            }, function (error, principals) {
                var principalLookup;

                if (error) {
                    console.log(error);
                    reject(error);
                }

                self.removeDevices(principals, store).then(function () {
                    principalLookup = principals.map(function (principal) {
                        return self.lookupDevice(principal, user, store);
                    });

                    Ember.RSVP.all(principalLookup).then(function () {
                        resolve();
                    }).catch(function (error) {
                        reject(error);
                    });
                });
            });
        });
    }
};

export default nitrogenEmberUtils;
