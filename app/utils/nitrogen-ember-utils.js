import Ember from 'ember';

var nitrogenEmberUtils = {
    /**
     * Find or create a user in Ember Data,
     * sourcing information from a Nitrogen
     * principal.
     * @param  {Ember Data store} store        [Ember Data Store to be used]
     * @param  {session} session               [Session object]
     * @param  {Nitrogen principal} principal  [Nitrogen principal, source of information]
     * @return {promise}
     */
    findOrCreateUser: function (store, session, principal) {
        var self = this;

        if (!store || !session || !principal) {
            return console.error('Called Ember Util findOrCreateUser with missing paramters:', arguments);
        }

        return new Ember.RSVP.Promise(function (resolve) {
            store.find('user', {
                id: 'me'
            }).then(function (foundUser) {
                if (foundUser.content.length > 0) {
                    foundUser = foundUser.content[0];

                    self.updateUser(foundUser, principal, session).then(function (result) {
                        resolve(result);
                    });
                }
            }, function () {
                let user = store.createRecord('user', {
                    id: 'me'
                });

                self.updateUser(user, principal, session).then(function (result) {
                    resolve(result);
                });
            });
        });
    },

    /**
     * Updates a user record with information received
     * from Nitrogen
     * @param  {Ember Data record (user)} user       [Record for the user that shall be modified]
     * @param  {Nitrogen principal} principal        [Nitrogen principal, the source of information]
     * @param  {session} session                     [Current Session]
     * @return {promise}                             [Ember Data promise (save)]
     */
    updateUser: function (user, principal, session) {
        if (!user || !principal || !session) {
            return console.error('Called Ember Util updateUser with missing paramters:', arguments);
        }

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

        return user.save();
    },

    /**
     * Updates a device record with information received
     * from Nitrogenm
     * @param  {Ember data record (device)} device [Device to update]
     * @param  {Nitrogen principal} principal      [Nitrogen principal to use as source of information]
     * @return {promise}                           [Ember Data promise (save)]
     */
    updateDevice: function (device, principal) {
        if (!device || !principal) {
            return console.error('Called Ember Util updateDevice with missing paramters:', arguments);
        }

        device.set('nitrogen_id', principal.id);
        device.set('name', principal.name);
        device.set('lastUpdated', principal.updated_at);
        device.set('last_connection', principal.last_connection);
        device.set('last_ip', principal.last_ip);
        device.set('nickname', principal.nickname);
        device.set('updated_at', principal.updated_at);
        device.set('created_at', principal.created_at);
        device.set('tags', principal.tags);
        device.set('type', principal.type);
        device.set('location', principal.location);
        device.set('gps', []);

        return device.save();
    },

    /**
     * Create a new device using a Nitrogen
     * principal as source
     * @param  {Ember data store} store       [Store to use]
     * @param  {Nitrogen principal} principal [Nitrogen principal to use as source of information]
     * @return {promise}                      [Ember Data promise (save)]
     */
    newDevice: function (store, principal) {
        if (!store || !principal) {
            return console.error('Called Ember Util newDevice with missing paramters:', store, principal);
        }

        var newDevice = store.createRecord('device');

        return this.updateDevice(newDevice, principal);
    },

    /**
     * Remove locally stored devices for a principal
     * @param  {array} principals            [Principals to lookup (and remove)]
     * @param  {Ember data store} store      [Store to use]
     * @return {promise}
     */
    removeDevices: function (principals, store) {
        if (!store || !principals) {
            return console.error('Called Ember Util removeDevices with missing paramters:', arguments);
        }

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

    /**
     * Lookup a locally stored device for a Nitrogen principal
     * @param  {Nitrogen principal} principal  [Nitrogen principal to lookup]
     * @param  {Ember data store} store        [Store to use]
     * @return {promise}
     */
    lookupDevice: function (principal, store) {
        var self = this;

        if (!store || !principal) {
            return console.error('Called Ember Util lookupDevice with missing paramters:', arguments);
        }

        return new Ember.RSVP.Promise(function (resolve) {
            store.find('device', {
                    nitrogen_id: principal.id
                })
                .then(function (foundDevices) {
                    if (foundDevices.get('length') === 0) {
                        return self.newDevice(store, principal);
                    }

                    if (foundDevices.get('length') > 1) {
                        console.log('WARNING: Multiple devices in store for one Nitrogen id!');
                        console.log('Number of devices in store for this id: ' + foundDevices.get('length'));
                    }

                    foundDevices.map(function (foundDevice) {
                        self.updateDevice(foundDevice, principal);
                    });

                    resolve();
                }, function () {
                    resolve(self.newDevice(store, principal));
                });
        });
    },

    /**
     * Update or create local devices to match the devices
     * Nitrogen has for a single user
     * @param  {Ember Data store} store   [Store to use]
     * @param  {session} session          [Session to use]
     * @return {promise}
     */
    updateOrCreateDevices: function (store, session) {
        var self = this;

        if (!store || !session) {
            return console.error('Called Ember Util updateOrCreateDevices with missing paramters:', arguments);
        }

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
                        return self.lookupDevice(principal, store);
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
