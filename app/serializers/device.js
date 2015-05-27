import DS from 'ember-data';

/**
 * Just telling Ember to use the LSSerializer for all device models.
 */
export default DS.LSSerializer.extend({
    // TODO: Update with the actual principal.id
    extractSingle: function (store, typeClass, payload) {
        payload.vehicle = '54d01ed20eabba6304eded64';
        return this._super(store, typeClass, payload);
    }
});
