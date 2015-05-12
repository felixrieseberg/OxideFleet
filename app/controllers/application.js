import Ember from 'ember';
import Config from '../config/environment';

export default Ember.Controller.extend({
    version: Config.APP.version,
    fullConfig: Config.APP
});
