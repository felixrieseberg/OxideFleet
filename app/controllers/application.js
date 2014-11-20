import Ember from 'ember';

export default Ember.Controller.extend({

    locations: function () {
        return this.store.find('location');
    }.property(),

    devices: function() {
    	return this.store.find('device');
    }.property(),
    
    currentUser: function () {
        return this.store.find('user', 'me');
    }.property()

});
