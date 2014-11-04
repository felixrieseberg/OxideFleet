import nitrogen_auth from '../authenticators/nitrogen';

var called = false;

export default {
	name: "authentication",
	initialize: function(container, application) {
		console.log("Loading nitrogen initializer.");
		container.register('authenticator:nitrogen', nitrogen_auth);
		called = true;
	}
};
