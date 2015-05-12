import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    driver_score: DS.attr('number')
});
