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
    selectedCar: null,

    /**
     * Are any cars in the model?
     * @return {boolean}
     */
    carsConnected: Ember.computed('model', function () {
        var model = this.get('model');

        if (model.content.length > 0) {
            return true;
        } else {
            return false;
        }
    }),

    /**
     * Add all cars to the 'tracked' list on init
     */
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

    /**
     * Subscribe to Nitrogen on init, assign a handler for incoming socket messages
     */
    subscribeToNitrogen: function () {
        this.get('nitrogenController').send('subscribeToNitrogen', this, 'handleSocketMessage');
    }.on('init'),

    /**
     * Observes `trackedCars` to sync map pushpins and tracked cars - if a car is marked as tracked,
     * this method will schedule `addOrRemoveCars` in the Ember Run Loop, ensuring that the map only
     * contains pushpins for cars actually tracked.
     */
    trackedCarsObserver: function () {
        var mapEntityTracker = this.get('mapEntityTracker'),
            trackedCars = this.get('trackedCars'),
            nitrogenController = this.get('nitrogenController'),
            map = this.get('mapReference'),
            self = this;

        function handleFoundDevices(foundDevices) {
            let foundDevice;

            if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                foundDevice = foundDevices.content[0];
                nitrogenController.send('getLastMessage', foundDevice.get('nitrogen_id'), 1, self, 'handleLastLocation');
            }
        }

        function addOrRemoveCars() {
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
                    self.store.find('device', {
                        nitrogen_id: trackedCars[i]
                    }).then(handleFoundDevices);
                }
            }
        }

        Ember.run.scheduleOnce('afterRender', addOrRemoveCars);
    }.observes('trackedCars.[]'),

    actions: {
        /**
         * Toggles whether or not a car should be tracked on map
         * @param  {Ember Data Record} device  - The car to be tracked
         */
        toggleCar: function (device) {
            var trackedCars = this.get('trackedCars');

            device.toggleProperty('trackOnMap');

            if (device.get('trackOnMap') === true) {
                trackedCars.pushObject(device.get('nitrogen_id'));
            } else {
                trackedCars.removeObject(device.get('nitrogen_id'));
            }
        },

        /**
         * Handles a locations array for a given device, cleaning the individual
         * 'location' data points and putting them into an array property on a
         * given car.
         *
         * This method is called when Nitrogen messages with location data are
         * retrieved.
         * @param  {array}   locations     - Locations array (format: {latitude: 1, longitude: 1, speed: 1, heading: 1, timestamp: 1})
         * @param  {string}   principalId  - Id of the car the locations should be attached to
         * @param  {Function} callback
         * @return {Ember Data Record}     - DS Record of the car the locations were added to
         */
        handleLocations: function (locations, principalId, callback) {
            var self = this;

            if (locations.length > 0) {
                this.store.find('device', {
                    nitrogen_id: principalId
                }).then(function (foundDevices) {
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

        /**
         * If a car is added to the map and the last location has to be retrieved, this callback is used
         * to handleLocations followed by adding the car to the map.
         * @param  {array}   locations     - Locations array (format: {latitude: 1, longitude: 1, speed: 1, heading: 1, timestamp: 1})
         * @param  {string}   principalId  - Id of the car the locations should be attached to
         */
        handleLastLocation: function (locations, principalId) {
            if (locations && principalId) {
                this.send('handleLocations', locations, principalId, 'addCarToMap');
            }
        },

        /**
         * Handles incoming socket messages from Nitrogen
         * @param  {object} message - Nitrogen message
         */
        handleSocketMessage: function (message) {
            var locations = [];

            if (message && message.from) {
                locations.push(message);
                this.send('handleLocations', locations, message.from, 'updateCar');
            }
        },

        /**
         * Updates a car on the map, moving his pushpin and drawing the path
         * @param  {Ember Data Record} device - Car to update on the map
         */
        updateCar: function (device) {
            var map = this.get('mapReference'),
                name = device.get('nitrogen_id'),
                mapEntityTracker = this.get('mapEntityTracker'),
                locations = device.get('gps'),
                lat = locations[locations.length - 1].latitude,
                lon = locations[locations.length - 1].longitude,
                lastLocation = {
                    longitude: lon,
                    latitude: lat
                },
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

        /**
         * Centers the map on a given location
         * @param  {object} location - The location to center on (format: {latitude: 1, longitude: 1})
         */
        centerMap: function (location) {
            var map = this.get('mapReference'),
                mapOptions = map.getOptions();

            mapOptions.zoom = 15;
            mapOptions.center = {
                'latitude': location.latitude,
                'longitude': location.longitude
            };
            map.setView(mapOptions);
        },

        /**
         * Centers the map on a given car
         * @param  {Ember Data Record} device - Car to center on
         */
        centerOnCar: function (device) {
            var locations = device.get('gps'),
                lastLocation = locations[locations.length - 1];

            this.send('centerMap', {
                'latitude': lastLocation.latitude,
                'longitude': lastLocation.longitude
            });
        },

        /**
         * Adds a given car to the map
         * @param  {Ember Data Record} device - Car to add
         */
        addCarToMap: function (device) {
            var locations = device.get('gps'),
                lastLocation = locations[locations.length - 1],
                iconUrl = 'assets/img/carIcon_smaller.png',
                iconOptions = {
                    'icon': iconUrl,
                    height: 40,
                    width: 40,
                    typeName: 'tooltipped'
                },
                map = this.get('mapReference'),
                mapLocations = [],
                pathOptions = {
                    strokeColor: new Microsoft.Maps.Color.fromHex('#4caf50'),
                    strokeThickness: 5
                },
                path, pin, entityLength;

            for (var i = 0; i < locations.length; i += 1) {
                mapLocations.push({
                    'latitude': locations[i].latitude,
                    'longitude': locations[i].longitude
                });
            }

            if (mapLocations && mapLocations.length > 0) {
                pin = new Microsoft.Maps.Pushpin({
                    'latitude': lastLocation.latitude,
                    'longitude': lastLocation.longitude
                }, iconOptions);
                path = new Microsoft.Maps.Polyline(mapLocations, pathOptions);

                // Save index of entities pushed (so we can update them later)
                entityLength = map.entities.getLength();
                this.get('mapEntityTracker').pushObject({
                    name: device.get('nitrogen_id'),
                    pin: entityLength,
                    path: entityLength + 1
                });

                // Tooltip
                this.send('addPinTooltip', pin, device.get('name'));

                // Push objects to map
                map.entities.push(pin);
                map.entities.push(path);
            }
        },

        /**
         * Adds a tooltip for a pushpin
         * @param {object} pin pushin
         */
        addPinTooltip: function (pin, tooltipText) {
            // Create Mouse Over Handler
            Microsoft.Maps.Events.addHandler(pin, 'mouseover', function (e) {
                var target = e.target.cm1002_er_etr.dom,
                    tiprCont = '.tiprContainer_bottom',
                    wt, ml;

                var out = '<div class="tiprContainer_bottom"><div class="tipr_point_bottom"><div class="tiprContent">' + tooltipText + '</div></div></div>';

                $(target).after(out);

                wt = $(tiprCont).outerWidth();
                ml = -(wt / 2 + 20);

                $(tiprCont).css('top', e.pageY + 20);
                $(tiprCont).css('left', e.pageX);
                $(tiprCont).css('margin-left', ml + 'px');

                $(tiprCont).fadeIn('200');
            });

            Microsoft.Maps.Events.addHandler(pin, 'mouseout', function () {
                $('.tiprContainer_bottom').remove();
            });
        },

        /**
         * Marks a given car as 'selected'
         * @param  {Ember Data Record} device - Car to select
         */
        selectCar: function (device) {
            Ember.$('.carlist').addClass('expanded');

            this.set('selectedCar', device);
            this.send('centerOnCar', device);
        },

        /**
         * Sets the currently selected car to null
         */
        deselectCar: function () {
            Ember.$('.carlist').removeClass('expanded');

            this.set('selectedCar', null);
        }
    }
});
