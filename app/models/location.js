import DS from 'ember-data';

export default DS.Model.extend({
    devices: DS.hasMany('devices')
});
