import DS from 'ember-data';

export default DS.Model.extend({
  eventType: DS.attr('string'),
  timestamp: DS.attr('string'),
  speed: DS.attr('number'),
  location: DS.belongsTo('location', {embedded: 'always'}),
  trip: DS.belongsTo('trip')
});
