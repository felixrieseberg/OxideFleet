import DS from 'ember-data';

/**
 * This model describes the driver as it exists
 * on a single trip
 * @type {DS.model}
 */
export default DS.Model.extend({
    name: DS.attr('string'),
    driver_score: DS.attr('number')
});
