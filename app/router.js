import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
    this.resource('dashboard', { path: '/' });

  	this.resource('device', { path: 'device/:device_id' }, function() { });
  	this.resource('user', { path: 'users/:user_id' }, function() { });
    this.resource('location', { path: 'location/:location_id' }, function() { });

    this.route('login');
    this.route('dashboard');
    this.route('settings');
});

export default Router;
