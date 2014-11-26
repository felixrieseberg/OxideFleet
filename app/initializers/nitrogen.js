import nitrogenAuth from '../authenticators/nitrogen';

export default {
	name: 'authentication',
	initialize: function (container) {
		console.log('Loading nitrogen initializer.');
		container.register('authenticator:nitrogen', nitrogenAuth);
	}
};
