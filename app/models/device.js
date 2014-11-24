import DS from 'ember-data';

var Device = DS.Model.extend({
    nitrogen_id: DS.attr('string'),
    name: DS.attr('string'),
    status: DS.attr('boolean', { defaultValue: false }),
    lastUpdated: DS.attr('number'),
    last_connection: DS.attr('string'),
    last_ip: DS.attr('string'),
    nickname: DS.attr('string'),
    created_at: DS.attr('string'),
    updated_at: DS.attr('string'),

    // Relations
    owner: DS.belongsTo('user', {async: true }),
    tags: DS.hasMany('tag', {async: true})
});

export default Device;