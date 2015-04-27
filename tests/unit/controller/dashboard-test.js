import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'oxide/tests/helpers/start-app';
import nitrogenEmberUtils from '../../../utils/nitrogen-ember-utils';
var App, store, session, principal, user, MockMap;

moduleFor('controller:dashboard', {
    needs: ['controller:nitrogen', 'controller:application'],
    
    setup: function () {
        App = startApp(null);
        store = App.__container__.lookup('store:main');
        session = App.__container__.lookup('simple-auth-session:main');
        var nitroService = new window.nitrogen.Service();

        // bing maps mock
        MockMap = function (assert) {
          // to ensure api conformance from our code to maps api
          this.assert = assert;
          this.options = {};
        };

        MockMap.prototype = {
          getOptions: function () {
            return this.options;
          },

          setView: function (options) {
            this.assert.ok(typeof options === 'object');
            this.assert.ok(typeof options.center.latitude === 'number');
            this.assert.ok(typeof options.center.longitude === 'number');
            this.assert.ok(typeof options.zoom === 'number');
          },

          entities: {
            list: [],
            getLength: function () {
              return 1;
            },
            push: function(pin) {
              this.list.push(pin);
            }
          }
        };

        nitroService.authenticate(null, (err, nitroSession, user) => {
          principal = nitroSession.principal;
          user = user;
          session.set('principal', principal);

          Ember.run(function() {
            user = store.createRecord('user', user);
            user.save();
            console.log('heres the fing ID:' + principal.id);
            nitrogenEmberUtils.newDevice(store, principal, user);
          });
        });
        
    },
    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }

});

test('it should track all cars', function(assert) {
  // insert assetation library to confirm we call api correctly
  assert.expect(3);
  window.nitrogen.assert = assert;
  var self = this;
  var trackAllCars = App.__container__.lookup('controller:dashboard').trackAllCars;
  var loginController = App.__container__.lookup('controller:dashboard');
  
  

  Ember.run(function(){
    var controller = self.subject({trackAllCars: function () {
      assert.ok(true);
      this.store = store;
      this.set('trackAllCars', trackAllCars);

      // observe track car mapping
      this.addObserver('trackedCars', controller, () => {
        // ensure all cars tracked
        assert.ok(this.get('trackedCars').length === 1);
        store.find('device').then(devices => {
          devices.forEach( device => { assert.ok(device.get('trackOnMap')); });
        });

      });

      this.trackAllCars();
      
    }.on('init')});
  });
});

test('it should toggle all cars', function(assert) {
  // insert assetation library to confirm we call api correctly
  assert.expect(4);
  window.nitrogen.assert = assert;
  var self = this;
  var trackAllCars = App.__container__.lookup('controller:dashboard').trackAllCars;
  var loginController = App.__container__.lookup('controller:dashboard');
  
  

  Ember.run(function(){
    self.subject({trackAllCars: function () {
      // test trackAllCars called on init.
      assert.ok(true);
      var controller = this;
      controller.store = store;
      controller.set('trackAllCars', trackAllCars);

      Ember.run( () => {
        // add test observer to test if cars are actually add/removed
        this.addObserver('trackedCars', controller, () => {
          // ensure all cars tracked
          assert.ok(this.get('trackedCars').length === 1);
          store.find('device').then(devices => {
            devices.forEach(device => {
              console.log("TOGGLE");
              controller.send('toggleCar', device);
              assert.ok(device.get('trackOnMap') === false);
            });
            assert.ok(controller.get('trackedCars').length === 0);
          });
        });

        // call the actual implementation
        controller.trackAllCars();
      });
      
    }.on('init')});
  });
});

test('it should update car location when it receives a socket message', function(assert) {
  // insert assetation library to confirm we call api correctly
  assert.expect(3);
  window.nitrogen.assert = assert;
  var self = this;
  var trackAllCars = App.__container__.lookup('controller:dashboard').trackAllCars;
  var loginController = App.__container__.lookup('controller:dashboard');
  
  

  Ember.run(function(){
    self.subject({trackAllCars: function () {
      // test trackAllCars called on init.
      assert.ok(true);
      var controller = this;
      controller.store = store;
      controller.set('trackAllCars', trackAllCars);

      Ember.run( () => {
        

        store.find('device').then(devices => {

          devices.forEach(device => {
            // this id is hard coded into the nitrogen mock
            let mockMessage = {
              from: 'abc-123',
              body: {
                timestamp: new Date(Date.now() - 3000),
                // tenderloin SF area...
                latitude: 37.783343 + Math.random(),
                longitude: -122.413207 + Math.random(),
                // km/hr? mi/hr?
                speed: '25.3'
              }
            };
            // call the actual implementation
            controller.trackAllCars();
            Ember.run( () => {
              controller.send('handleSocketMessage', mockMessage, 'updateCar');
              controller.addObserver('trackedCars', controller, () => {

                Ember.run( () => {

                    store.find('device', {nitrogen_id: 'abc-123'}).then(devices => {
                      assert.ok(devices.content[0].get('gps')[0].longitude === mockMessage.body.longitude);
                      assert.ok(devices.content[0].get('gps')[0].latitiude === mockMessage.body.latitiude);
                    });

                });

              });
            });
            
          });
        });
      });
      
    }.on('init')});
  });
});

test('it should center the map', function(assert) {
  // insert assetation library to confirm we call api correctly
  assert.expect(7);
  window.nitrogen.assert = assert;
  var self = this;
  var trackAllCars = App.__container__.lookup('controller:dashboard').trackAllCars;
  var loginController = App.__container__.lookup('controller:dashboard');
  
  

  Ember.run(function(){
    self.subject({trackAllCars: function () {
      // test trackAllCars called on init.
      assert.ok(true);
      var controller = this;
      controller.store = store;
      controller.set('trackAllCars', trackAllCars);

      Ember.run( () => {
        var testLat = 37.783343 + Math.random();
        var testLon = -122.413207 + Math.random();
        // insert a fake map for the controller
        var mockMapRef = new MockMap(assert);
        controller.set('mapReference', mockMapRef);
        controller.send('centerMap', {latitude: testLat, longitude: testLon});
        // should have set lat and lon accordingly
        assert.ok(mockMapRef.getOptions().center.latitude === testLat);
        assert.ok(mockMapRef.getOptions().center.longitude === testLon);
      });
      
    }.on('init')});
  });
});

test('it should center on car', function(assert) {
  // insert assetation library to confirm we call api correctly
  assert.expect(7);
  window.nitrogen.assert = assert;
  var self = this;
  var trackAllCars = App.__container__.lookup('controller:dashboard').trackAllCars;
  var loginController = App.__container__.lookup('controller:dashboard');
  
  Ember.run(function(){
    self.subject({trackAllCars: function () {
      // test trackAllCars called on init.
      assert.ok(true);
      var controller = this;
      controller.store = store;
      controller.set('trackAllCars', trackAllCars);
      
      Ember.run( () => {
        // call the actual implementation
        controller.trackAllCars();
        // insert a fake map for the controller
        var mockMapRef = new MockMap(assert);
        controller.set('mapReference', mockMapRef);

        store.find('device', {nitrogen_id: 'abc-123'}).then(devices => {
          var gps = devices.content[0].get('gps');
          var firstLoc = {
            latitude: 37.783343 + Math.random(),
            longitude: -122.413207 + Math.random()
          };
          var secondLoc = {
            latitude: 37.783343 + Math.random(),
            longitude: -122.413207 + Math.random()
          };
          gps.push(firstLoc);
          gps.push(secondLoc);
          controller.send('centerOnCar', devices.content[0]);
          // should have set lat and lon accordingly
          assert.ok(mockMapRef.getOptions().center.latitude === secondLoc.latitude);
          assert.ok(mockMapRef.getOptions().center.longitude === secondLoc.longitude);
        });
        
      });
      
    }.on('init')});
  });
});


test('it should add a car to map', function(assert) {
  // insert assetation library to confirm we call api correctly
  assert.expect(11);
  // add asserts to our mock apis
  window.nitrogen.assert = assert;
  window.Microsoft.assert = assert;
  var self = this;
  var trackAllCars = App.__container__.lookup('controller:dashboard').trackAllCars;
  var loginController = App.__container__.lookup('controller:dashboard');
  
  Ember.run(function(){
    self.subject({trackAllCars: function () {
      // test trackAllCars called on init.
      assert.ok(true);
      var controller = this;
      controller.store = store;
      controller.set('trackAllCars', trackAllCars);
      
      Ember.run( () => {
        // call the actual implementation
        controller.trackAllCars();
        // insert a fake map for the controller
        var mockMapRef = new MockMap(assert);
        controller.set('mapReference', mockMapRef);

        store.find('device', {nitrogen_id: 'abc-123'}).then(devices => {
          var gps = devices.content[0].get('gps');
          var firstLoc = {
            latitude: 37.783343 + Math.random(),
            longitude: -122.413207 + Math.random()
          };
          var secondLoc = {
            latitude: 37.783343 + Math.random(),
            longitude: -122.413207 + Math.random()
          };
          gps.push(firstLoc);
          gps.push(secondLoc);
          controller.send('addCarToMap', devices.content[0]);
        });
        
      });
      
    }.on('init')});
  });
});