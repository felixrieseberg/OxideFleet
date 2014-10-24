import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr("string"),
  public_key: DS.attr("string")
});
