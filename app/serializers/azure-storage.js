import DS from 'ember-data';
// ////////////////////////////////////////////////
// Azure Storage Serializer
// Nothing to do, azure library does serializtion
// this is here to override the default serializer
// ////////////////////////////////////////////////
export default DS.Serializer.extend({
    extract: function (store, type, payload) {
        return payload;
    },
    serialize: function (record) {
        return record;
    },
    serializeHasMany: function (record) {
        return record;
    },
    serializeBlongsTo: function (record) {
        return record;
    }
});
