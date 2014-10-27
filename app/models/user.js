import DS from 'ember-data';

export default DS.Model.extend({
	email: DS.attr('string'),
	password: DS.attr('string'),
	FIXTURES: [
		{id: 1, email: 'test@home.com', password: 'abc123'}
	]
});
