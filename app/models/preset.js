import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    fahrenheit: DS.attr('number'),
    minutes: DS.attr('number'),
	// Array
    selectedDays: DS.attr() 
});
