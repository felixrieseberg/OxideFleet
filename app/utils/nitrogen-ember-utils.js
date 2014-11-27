import Ember from 'ember';

var nitrogenEmberUtils = {
    findOrCreateUser: function (store, session, principal) {
        return new Ember.RSVP.Promise(function (resolve) {
            var user = store.createRecord('user', {id: 'me'});
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
    },

    updateDevice: function (foundDevice, device, owner) {
        console.log('Found: ', device, ' for Owner: ', owner);
        foundDevice.set('nitrogen_id', device.id);
        foundDevice.set('name', device.name);
        foundDevice.set('lastUpdated', device.updated_at);
        foundDevice.set('last_connection', device.last_connection);
        foundDevice.set('last_ip', device.last_ip);
        foundDevice.set('nickname', device.nickname);
        foundDevice.set('updated_at', device.updated_at);
        foundDevice.set('created_at', device.created_at);
        foundDevice.set('owner', owner);

        return foundDevice.save();
    },

    newDevice: function (store, device, owner) {
        console.log('New Device: ', device, ' for Owner: ', owner);

        var newDevice = store.createRecord('device', {
            nitrogen_id: device.id,
            name: device.name,
            lastUpdated: device.updated_at,
            last_connection: device.last_connection,
            last_ip: device.last_ip,
            nickname: device.nickname,
            created_at: device.created_at,
            updated_at: device.updated_at,
            owner: owner
        });

        return newDevice.save();
    },

    lookupDevice: function (principal, user, store) {
        var self = this;

        return new Ember.RSVP.Promise(function (resolve) {
            console.log('Looking up device with nitrogen id ' + principal.id);
            store.find('device', {nitrogen_id: principal.id})
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
                sort: {last_connection: 1}
            }, function (error, principals) {
                var principalLookup;

                if (error) {
                    console.log(error);
                    reject(error);
                }

                principalLookup = principals.map(function (principal) {
                    return self.lookupDevice(principal, user, store);
                });

                Ember.RSVP.all(principalLookup).then(function () {
                    resolve();
                }).catch(function (error) {
                    reject (error);
                });
            });
        });
    }
};

export default nitrogenEmberUtils;
