import DS from 'ember-data';

/**
 * This model describes a location as it es
 * @type {[type]}
 */
export default DS.Model.extend({
    tripEvent: DS.belongsTo('event'),
    latitude: DS.attr('number'),
    longitude: DS.attr('number'),
    altitude: DS.attr('number'),
    direction: DS.attr('number')
});
