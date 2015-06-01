import DS from 'ember-data';

/**
 * Just telling Ember to use the LSSerializer for all device models.
 * Also: Adding the vehicle id.
 */
export default DS.LSSerializer.extend({
    extractSingle: function (store, typeClass, payload) {
        payload.vehicle = payload.nitrogen_id;
        return this._super(store, typeClass, payload);
    }
});
