import Ember from 'ember';
import DS from 'ember-data';

/**
 * An Array Transform for Ember Data, allowing us
 * to use and serialize arrays.
 */
export default DS.Transform.extend({
    deserialize: function (value) {
        if (Ember.isArray(value)) {
            return Ember.A(value);
        } else {
            return Ember.A();
        }
    },
    serialize: function (value) {
        if (Ember.isArray(value)) {
            return Ember.A(value);
        } else {
            return Ember.A();
        }
    }
});
