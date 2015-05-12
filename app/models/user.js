import DS from 'ember-data';

/**
 * This model describes the user, which is
 * usually created from a Nitrogen principa;
 * @type {DS.model}
 */
export default DS.Model.extend({
    // Nitrogen
    name: DS.attr('string'),
    email: DS.attr('string'),
    api_key: DS.attr('string'),
    created_at: DS.attr('string'),
    nitrogen_id: DS.attr('string'),
    last_connection: DS.attr('string'),
    last_ip: DS.attr('string'),
    nickname: DS.attr('string'),
    password: DS.attr('string'),
    updated_at: DS.attr('string')
});
