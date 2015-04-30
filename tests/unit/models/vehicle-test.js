/* global start */
/* global stop */
import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'oxide/tests/helpers/start-app';
var App, store, session;

moduleFor('model:vehicle', {
    needs: ['adapter:jsonapi', 'model:driver', 'model:trip', 'model:event'],
    
    setup: function () {
        App = startApp(null);
        store = App.__container__.lookup('store:main');
        session = App.__container__.lookup('simple-auth-session:main');
        var serializer = App.__container__.lookup('serializer:jsonapi');
        serializer.store = store;
    },
    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }

});
test('it returns all vehicles', function(assert) {
  assert.expect(3);
  
  Ember.run( () => {
    stop();
    store.find('vehicle')
    .then( vehicles => {
      vehicles.forEach( vehicle => {
          assert.ok(vehicle);
          vehicle.get('trips')
          .then(trips => {
            trips.forEach(trip => {
              assert.ok(trip);
              trip.get('driver')
              .then( driver => {
                assert.ok(typeof driver.get('name') === 'string');
                start();
              }, err => {
                console.log(err.stack);
                start();
              });
            });
          }, err => {
            console.error(err.stack);
            start();
          });
      }, err => {
        console.error(err.stack);
        start();
      });
    });
  });
});

test('it returns vehicle with specified id', function(assert) {
  assert.expect(29);
  Ember.run( () => {

    stop();
    store.find('vehicle', '553ac59934dff597a9708c71').then( vehicle => {
      assert.ok(vehicle);
      vehicle.get('trips').forEach(trip => {
        trip.get('tripEvents').then(events => {
          events.forEach( event => {
            assert.ok(event.get('eventType') && typeof event.get('eventType') === 'string');
            assert.ok(event.get('timestamp') && typeof event.get('timestamp') === 'string');
            assert.ok(event.get('speed') && typeof event.get('speed') === 'number');
            assert.ok(typeof event.get('location') === 'object');
            assert.ok(typeof event.get('trip') === 'object');
            assert.ok(event.get('location').get('latitude') && typeof event.get('location').get('latitude') === 'number');
            assert.ok(event.get('location').get('longitude') && typeof event.get('location').get('longitude') === 'number');
          });
        });
      });
      start();

      
    });
  });
  
});

