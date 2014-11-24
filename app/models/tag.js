import DS from 'ember-data';

export default DS.Model.extend({
    value: DS.attr('string'),

    // Relations
    devices: DS.hasMany('device', {async: true})
});
