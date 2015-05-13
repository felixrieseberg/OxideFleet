import nitrogenAuth from '../authenticators/nitrogen';

/**
 * Initializes the Nitrogen Authenticator.
 * If this doesn't mean anything to you, you're not alone - check this out:
 * http://emberjs.com/api/classes/Ember.Application.html#toc_initializers
 */
export default {
	name: 'authentication',
	initialize: function (container) {
		container.register('authenticator:nitrogen', nitrogenAuth);
	}
};
