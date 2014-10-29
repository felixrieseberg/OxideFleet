import DS from 'ember-data';

var Device = DS.Model.extend({
    name: DS.attr("string"),
    status: DS.attr('boolean', { defaultValue: false }),
    public_key: DS.attr('string'),
    location: DS.belongsTo('location', { async: true })
});

export default Device;