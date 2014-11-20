import DS from 'ember-data';

var Device = DS.Model.extend({
    name: DS.attr("string"),
    status: DS.attr('boolean', { defaultValue: false }),
    // public_key: DS.attr('string'),
    location: DS.belongsTo('location', { async: true }),
    lastUpdated: DS.attr('number'),
    // created_at: DS.attr('string'),
    // last_connection: DS.attr('string'),
    // last_ip: DS.attr('string'),
    // nickname: DS.attr('string'),
    // updated_at: DS.attr('string'),

    // Relations
    owner: DS.belongsTo('user', {async: true }),
});

export default Device;