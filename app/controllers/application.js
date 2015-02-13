import Ember from 'ember';

export default Ember.Controller.extend({

    devices: function () {
        return this.store.find('device');
    }.property(),

    currentUser: function () {
        return this.store.find('user', 'me');
    }.property()

});
