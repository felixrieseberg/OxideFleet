import Ember from 'ember';
import Config from '../config/environment';

export default Ember.Controller.extend({

    version: Config.APP.version,

    devices: function () {
        return this.store.find('device');
    }.property(),

    currentUser: function () {
        return this.store.find('user', 'me');
    }.property()

});
