import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'oxide/tests/helpers/start-app';
var App, store, session;

moduleFor('controller:login', {
    needs: ['controller:application'],
    
    setup: function () {
        App = startApp(null);
        store = App.__container__.lookup('store:main');
        session = App.__container__.lookup('simple-auth-session:main');
    },
    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }

});

test('it should login and toggle the loading state', function(assert) {
  // insert assetation library to confirm we call api correctly
  window.nitrogen.assert = assert;
  assert.expect(6); 
  var controller = this.subject();
  controller.store = store;
  var loggingIn = false;
  controller.addObserver('loading', controller, function() {
    if (!loggingIn) {
      assert.ok(controller.get('loading'));
      loggingIn = true;
    }
    else {
      assert.ok(controller.get('loading') === false);
    }
  });
  Ember.run(function(){
      controller.set('identification', 'testuser');
      controller.set('password', 'testpassword');
      assert.ok(controller.get('loading') === false);
      controller.set('session', session);
      controller.send('authenticate');
  });
});