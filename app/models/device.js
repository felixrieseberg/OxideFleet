import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr("string"),
    status: DS.attr('boolean', { defaultValue: false }),
    public_key: DS.attr('string'),
    location: DS.belongsTo('location')
});
