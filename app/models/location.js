import DS from 'ember-data';

export default DS.Model.extend({
  tripEvent: DS.belongsTo('event'),
  latitude: DS.attr('number'),
  longitude: DS.attr('number'),
  altitude: DS.attr('number'),
  direction: DS.attr('number')
});
