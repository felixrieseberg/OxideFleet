import DS from 'ember-data';

/**
 * This model describes the vehicle property on the 'device'
 * @type {DS.Model}
 */
export default DS.Model.extend({
    trips: DS.hasMany('trip', {async: true}),
    name: DS.attr('string'),
    isActive: DS.attr('boolean', {defaultValue: false}),
    vin: DS.attr('string'),
    make: DS.attr('string'),
    model: DS.attr('string'),
    production_year: DS.attr('string'),
    mileage: DS.attr('string')
});
