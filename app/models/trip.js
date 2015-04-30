import DS from 'ember-data';

export default DS.Model.extend({
  vehicle: DS.belongsTo('vehicle', {async: true}),
  tripEvents: DS.hasMany('event', {embedded: 'always', async: true}),
  driver: DS.belongsTo('driver', {async: true})
});
