import nitrogen_auth from '../authenticators/nitrogen';
// import Config from '../config/environment';

var called = false;

export default {
	name: "authentication",
	initialize: function (container, application) {
		console.log("Loading nitrogen initializer.");
		container.register('authenticator:nitrogen', nitrogen_auth);
		called = true;
		// application.nitrogenService = new nitrogen.Service(Config.APP.nitrogen);
	}
};
