import DS from 'ember-data';

export default DS.Model.extend({
	email: DS.attr(),
	password: DS.attr(),
	FIXTURES: [
		{id: 1, email: 'test@home.com', password: 'abc123'}
	]
});
