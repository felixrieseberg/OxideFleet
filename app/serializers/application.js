import JsonApiSerializer from 'ember-json-api/json-api-serializer';
import DS from 'ember-data';

/**
 * Serializer for the JSON API
 */
export default JsonApiSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        // tell the serializer that these attribute
        // names are always expected to be embedded
        // in the doc, and not linked
        event: {embedded: 'always'},
        location: {embedded: 'always'},
        tripEvents: {embedded: 'always'}
    }
});
