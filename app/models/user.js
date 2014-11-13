import DS from 'ember-data';

var User = DS.Model.extend({
    
    // Oxide
    avatarUrl: DS.attr('string'),

    // Nitrogen
    name: DS.attr('string'),
    email: DS.attr('string'),
    api_key: DS.attr('string'),
    created_at: DS.attr('string'),
    nId: DS.attr('string'),
    last_connection: DS.attr('string'),
    last_ip: DS.attr('string'),
    nickname: DS.attr('string'),
    password: DS.attr('string'),
    updated_at: DS.attr('string'),

    // Relations
    devices: DS.hasMany('device', { async: true })
});

export default User;