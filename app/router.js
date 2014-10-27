import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
	this.resource('home', { path: '/' });
    this.resource('settings', { path: '/settings' });
  	this.resource('device', { path: 'devices/:device_id' }, function() { });
  	this.resource('user', { path: 'users/:user_id' }, function() { });
});

export default Router;
