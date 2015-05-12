import DS from 'ember-data';

/**
 * This model describes a trip event as it exists on a trip.
 * @type {[type]}
 */
export default DS.Model.extend({
    eventType: DS.attr('string'),
    timestamp: DS.attr('string'),
    speed: DS.attr('number'),
    location: DS.belongsTo('location', {embedded: 'always'}),
    trip: DS.belongsTo('trip')
});
