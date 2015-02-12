import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    waterheaters: DS.hasMany('device', {async: true})
});
