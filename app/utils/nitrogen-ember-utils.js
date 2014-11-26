import Ember from 'ember';

var nitrogenEmberUtils = {
    findOrCreateUser: function (store, session, principal, foundUser) {
        var newUser;

        if (foundUser === null) {
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

        // Once we have a Nitrogen Tags API, we can introduce this.
        // if (device.tags.length > 0) {
        //     tagLookup = device.tags.map(function (tag) {
        //         return self.lookupTag(tag);
        //     });

        //     Ember.RSVP.all(tagLookup).then(function (tags) {
        //         foundDevice.set('tags', tags);
        //         return foundDevice.save();
        //     })            
        // } else {
        //     return foundDevice.save();
        // }
        
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
            owner: this.store.find('user', 'me')
        });

        // Once we have a Nitrogen Tags API, we can introduce this.
        // if (device.tags.length > 0) {
        //     tagLookup = device.tags.map(function (tag) {
        //         return self.lookupTag(tag);
        //     });

        //     Ember.RSVP.all(tagLookup).then(function (tags) {
        //         newDevice.set('tags', tags);
        //         return newDevice.save();
        //     })            
        // } else {
        //     return newDevice.save();
        // }
        
        return newDevice.save();
    },

    // lookupTag: function (tag, store) {
    //     var self = this;

    //     return new Ember.RSVP.Promise(function (resolve) {
    //         store.find('tag', {value: tag}).then(function (records) {
    //             return records.get('firstObject');
    //         }, function () {
    //             return self.store.createRecord('tag', {value: tag});
    //         });
    //     });
    // },

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
