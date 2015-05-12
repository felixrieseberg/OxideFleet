import DS from 'ember-data';

/**
 * This model describes a trip as it exists on a vehicle.
 * @type {DS.model}
 */
export default DS.Model.extend({
    vehicle: DS.belongsTo('vehicle', {async: true}),
    tripEvents: DS.hasMany('event', {embedded: 'always', async: true}),
    driver: DS.belongsTo('driver', {async: true})
});
