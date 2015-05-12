import DS from 'ember-data';

/**
 * This model describes a Nitrogen device.
 * For the purpose of OxideFleet, the device is
 * extended with "car" properties, which are
 * assigned by the client as soon as the
 * device is retrieved from Nitrogen.
 * @type {DS.model}
 */
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
    vehicle: DS.belongsTo('vehicle', {async: true}),
});

export default Device;
