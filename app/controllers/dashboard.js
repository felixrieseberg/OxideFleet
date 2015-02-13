/* global Microsoft */
import Ember from 'ember';

export default Ember.ArrayController.extend({
    title: 'Dashboard',
    needs: 'application',
    appController: Ember.computed.alias('controllers.application'),
    subscribeToNitrogen: false,
    mapEntityTracker: [],
    trackedCars: [],
    information: false,

    carsConnected: Ember.computed('model', function () {
        var model = this.get('model');

        if (model.content.length > 0) {
            return true;
        } else {
            return false;
        }
    }),

    actions: {
        trackCar: function (principalId) {
            this.send('getMessage', principalId, 1);
            this.send('subscribeToNitrogen');
        },

        carTrackerChange: function () {
            var devices = this.get('model').content,
                trackedCars = this.get('trackedCars'),
                i;

            for (i = 0; i < devices.length; i += 1) {
                var name = devices[i].get('nitrogen_id'),
                    track = devices[i].get('trackOnMap');

                console.log('Track', name, track);

                if (track && trackedCars.indexOf(name) === -1) {
                    // Car currently not tracked, but should be
                    this.send('trackCar', devices[i].get('nitrogen_id'));
                } else if (!track && trackedCars.indexOf(name) > -1) {
                    // Car currently tracked, but should not be
                    // TODO
                    console.log('Untracking not implemented');
                }
            }
        },

        subscribeToNitrogen: function () {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession'),
                self = this;

            if (this.get('subscribedToNitrogen')) {
                return;
            }

            nitrogenSession.onMessage({
                $or: [
                    { type: 'location' }
                ]
            }, function(message) {
                console.log('Message Received. New Location:', message.body);

                self.store.find('device', {nitrogen_id: message.from})
                .then(function (foundDevices) {
                    var foundDevice;

                    if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                        foundDevice = foundDevices.content[0];
                        foundDevice.get('gps').pushObject(message.body);
                        self.send('updateCar', foundDevice);
                    }
                });
            });

            this.set('subscribedToNitrogen', true);
        },

        updateCar: function (device) {
            var map = this.get('mapReference'),
                name = device.get('nitrogen_id'),
                mapEntityTracker = this.get('mapEntityTracker'),
                locations = device.get('gps'),
                lat = locations[locations.length - 1].latitude,
                lon = locations[locations.length - 1].longitude,
                lastLocation = {longitude: lon, latitude: lat},
                pathLocations, path, pin, i;

            this.set('speed', Math.round(locations[locations.length - 1].speed));
            this.set('lastLocation', lastLocation);
            this.set('lat', lat.toFixed(4));
            this.set('lon', lon.toFixed(4));

            for (i = 0; i < mapEntityTracker.length; i += 1) {
                if (mapEntityTracker[i].name === name) {
                    path = map.entities.removeAt(mapEntityTracker[i].path);
                    pin = map.entities.removeAt(mapEntityTracker[i].pin);

                    pin.setLocation(lastLocation);
                    map.entities.insert(pin, mapEntityTracker[i].pin);

                    pathLocations = path.getLocations();
                    pathLocations.push(lastLocation);
                    map.entities.insert(path, mapEntityTracker[i].path);
                }
            }
        },

        centerMap: function (location) {
            var map = this.get('mapReference'),
                mapOptions = map.getOptions();

            mapOptions.zoom = 15;
            mapOptions.center = {'latitude': location.latitude, 'longitude': location.longitude};
            map.setView(mapOptions);
        },

        addCarToMap: function (device) {
            var locations = device.get('gps'),
                lastLocation = locations[0],
                iconUrl = 'assets/img/carIcon.png',
                iconOptions = {'icon': iconUrl, height: 50, width: 50},
                map = this.get('mapReference'),
                mapLocations = [],
                pathOptions = {strokeColor: new Microsoft.Maps.Color.fromHex('#009587'), strokeThickness: 5},
                path, pin, entityLength;

            for (var i = 0; i < locations.length; i += 1) {
                mapLocations.push({'latitude': locations[i].latitude, 'longitude': lastLocation.longitude});
            }

            pin = new Microsoft.Maps.Pushpin({'latitude': lastLocation.latitude, 'longitude': lastLocation.longitude}, iconOptions);
            path = new Microsoft.Maps.Polyline(mapLocations, pathOptions);

            // Save index of entities pushed (so we can update them later)
            entityLength = map.entities.getLength();
            this.get('mapEntityTracker').pushObject({
                name: device.get('nitrogen_id'),
                pin: entityLength,
                path: entityLength + 1
            });
            this.get('trackedCars').pushObject(device.get('nitrogen_id'));

            // Push objects to map
            map.entities.push(pin);
            map.entities.push(path);

            this.set('information', true);
            this.set('speed', Math.round(lastLocation.speed));
            this.set('lat', lastLocation.latitude.toFixed(4));
            this.set('lon', lastLocation.longitude.toFixed(4));
            this.set('lastLocation', lastLocation);
            this.set('currentCar', device);

            this.send('centerMap', {'latitude': lastLocation.latitude, 'longitude': lastLocation.longitude});
        },

        getMessage: function (principalId, messageLimit) {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession'),
                limit = (messageLimit) ? messageLimit : 0,
                self = this;

            if (nitrogenSession && principalId) {
                nitrogen.Message.find(nitrogenSession, { type: 'location', from: principalId }, { sort: { ts: -1 }, limit: limit }, 
                    function(err, locations) {
                        if (err) {
                            return;
                        }

                        if (locations.length > 0) {
                            self.store.find('device', { nitrogen_id: principalId }).then(function (foundDevices) {
                                var foundDevice, i,
                                    gps;

                                if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                                    foundDevice = foundDevices.content[0];
                                    gps = foundDevice.get('gps');

                                    for (i = 0; i < locations.length; i += 1) {
                                        gps.pushObject(locations[i].body);
                                    }
                                    self.send('addCarToMap', foundDevice);
                                }
                            });
                        }
                    }
                );
            }
        }
    }
});
