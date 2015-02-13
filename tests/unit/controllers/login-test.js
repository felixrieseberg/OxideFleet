import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:login', 'LoginController', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});

test('has correct title', function () {
    var controller = this.subject(),
        title = controller.get('title');
        
    ok(title === 'Sign In');
});

