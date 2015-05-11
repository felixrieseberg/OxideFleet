import DS from 'ember-data';

var Device = DS.Model.extend({
    nitrogen_id: DS.attr('string'),
    name: DS.attr('string'),
    status: DS.attr('boolean', {defaultValue: false}),
    lastUpdated: DS.attr('number'),
    last_connection: DS.attr('string'),
    last_ip: DS.attr('string'),
    nickname: DS.attr('string'),
    created_at: DS.attr('string'),
    updated_at: DS.attr('string'),
    tags: DS.attr(),
    type: DS.attr(),
    location: DS.attr(),

    // Connected Car
    gps: DS.attr('array'),
    trackOnMap: DS.attr('boolean'),

    // Relations
    owner: DS.belongsTo('user', {async: true}),

    // Mocks until we can marry device & vehicle
    trips: DS.hasMany('trip', {async: true}),
    is_active: DS.attr('boolean'),
    vin: DS.attr('string'),
    make: DS.attr('string'),
    model: DS.attr('string'),
    production_year: DS.attr('string'),
    mileage: DS.attr('string')
});

export default Device;
