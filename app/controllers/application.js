import Ember from 'ember';

export default Ember.Controller.extend({

    locations: function () {
        return this.store.find('location');
    }.property(),

    currentUser: function () {
        return this.store.find('user', 'me');
    }.property()

});
