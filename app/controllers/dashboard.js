/* global Microsoft */
import Ember from 'ember';

export default Ember.ArrayController.extend({
    title: 'Dashboard',
    needs: ['application', 'nitrogen'],
    version: Ember.computed.alias('controllers.application.version'),
    appController: Ember.computed.alias('controllers.application'),
    nitrogenController: Ember.computed.alias('controllers.nitrogen'),
    mapEntityTracker: [],
    trackedCars: [],

    carsConnected: Ember.computed('model', function () {
        var model = this.get('model');

        if (model.content.length > 0) {
            return true;
        } else {
            return false;
        }
    }),

    // Add all cars to the 'tracked' list on init
    trackAllCars: function () {
        var replaceCars = [];

        this.store.find('device').then(devices => {
            if (devices && devices.content) {
                for (let i = 0; i < devices.content.length; i += 1) {
                    console.log('adding device');
                    let device = devices.content[i];
                    device.set('trackOnMap', true);
                    device.save();
                    replaceCars.push(device.get('nitrogen_id'));
                }
            }

            this.set('trackedCars', replaceCars);
        });
    }.on('init'),

    // Subscribe to Nitrogen on init of dashboard
    subscribeToNitrogen: function () {
        this.get('nitrogenController').send('subscribeToNitrogen', this, 'handleSocketMessage');
    }.on('init'),

    // Observes `trackedCars` to sync map pushpins and tracked cars
    trackedCarsObserver: function () {
        var mapEntityTracker = this.get('mapEntityTracker'),
            trackedCars = this.get('trackedCars'),
            nitrogenController = this.get('nitrogenController'),
            map = this.get('mapReference'),
            self = this;

        console.log(this.get('trackedCars.[]').length);

        function handleFoundDevices (foundDevices) {
            let foundDevice;

            if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                foundDevice = foundDevices.content[0];
                nitrogenController.send('getLastMessage', foundDevice.get('nitrogen_id'), 1, self, 'handleLastLocation');
            }
        }

        function addOrRemoveCars () {
            console.log('addOrRemoveCars');
            for (let i = 0; i < mapEntityTracker.length; i += 1) {
                if (trackedCars.indexOf(mapEntityTracker[i].name) === -1) {
                    // Car is on map, but not in trackedCars - remove from map
                    map.entities.removeAt(mapEntityTracker[i].path);
                    map.entities.removeAt(mapEntityTracker[i].pin);
                    mapEntityTracker.splice(i, 1);
                }
            }

            for (let i = 0; i < trackedCars.length; i += 1) {
                if (!mapEntityTracker.findBy('name', trackedCars[i])) {
                    // Car is not on map, but in trackedCars - add to map
                    self.store.find('device', { nitrogen_id: trackedCars[i] }).then(handleFoundDevices);
                }
            }
        }

        Ember.run.scheduleOnce('afterRender', addOrRemoveCars);
    }.observes('trackedCars.[]'),

    actions: {
        toggleCar: function (device) {
            var trackedCars = this.get('trackedCars');

            device.toggleProperty('trackOnMap');

            if (device.get('trackOnMap') === true) {
                trackedCars.pushObject(device.get('nitrogen_id'));
            } else {
                trackedCars.removeObject(device.get('nitrogen_id'));
            }
        },

        handleLocations: function (locations, principalId, callback) {
            var self = this;

            if (locations.length > 0) {
                this.store.find('device', { nitrogen_id: principalId }).then(function (foundDevices) {
                    var foundDevice, i,
                        gps;

                    if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                        foundDevice = foundDevices.content[0];
                        gps = foundDevice.get('gps');

                        for (i = 0; i < locations.length; i += 1) {
                            if (!locations[i].body.timestamp) {
                                locations[i].body.timestamp = Date.now();
                            }

                            gps.pushObject(locations[i].body);
                            foundDevice.save();
                        }

                        if (foundDevice.get('trackOnMap')) {
                            self.send(callback, foundDevice);
                        }
                    }
                });
            }
        },

        handleSocketMessage: function (message) {
            var locations = [];

            if (message && message.from) {
                locations.push(message);
                this.send('handleLocations', locations, message.from, 'updateCar');
            }
        },

        handleLastLocation: function (locations, principalId) {
            if (locations && principalId) {
                this.send('handleLocations', locations, principalId, 'addCarToMap');
            }
        },

        updateCar: function (device) {
            console.log(device);

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
                    path.setLocations(pathLocations);
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

        centerOnCar: function (device) {
            var locations = device.get('gps'),
                lastLocation = locations[locations.length - 1];

            this.send('centerMap', {'latitude': lastLocation.latitude, 'longitude': lastLocation.longitude});
        },

        addCarToMap: function (device) {
            var locations = device.get('gps'),
                lastLocation = locations[locations.length - 1],
                iconUrl = 'assets/img/carIcon_smaller.png',
                iconOptions = {'icon': iconUrl, height: 40, width: 40},
                map = this.get('mapReference'),
                mapLocations = [],
                pathOptions = {strokeColor: new Microsoft.Maps.Color.fromHex('#4caf50'), strokeThickness: 5},
                path, pin, entityLength;

            for (var i = 0; i < locations.length; i += 1) {
                mapLocations.push({'latitude': locations[i].latitude, 'longitude': locations[i].longitude});
            }

            if (mapLocations && mapLocations.length > 0) {
                pin = new Microsoft.Maps.Pushpin({'latitude': lastLocation.latitude, 'longitude': lastLocation.longitude}, iconOptions);
                path = new Microsoft.Maps.Polyline(mapLocations, pathOptions);

                // Save index of entities pushed (so we can update them later)
                entityLength = map.entities.getLength();
                this.get('mapEntityTracker').pushObject({
                    name: device.get('nitrogen_id'),
                    pin: entityLength,
                    path: entityLength + 1
                });

                // Push objects to map
                map.entities.push(pin);
                map.entities.push(path);
            }
        }
    }
});
