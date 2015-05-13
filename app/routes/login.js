import Ember from 'ember';
import UnauthenticatedRouteMixin from 'simple-auth/mixins/unauthenticated-route-mixin';

/**
 * This might look empty, but we're mixing in the UnauthenticatedRouteMixin,
 * therefore allowing this route to be accessed without a session.
 */
export default Ember.Route.extend(UnauthenticatedRouteMixin, {
});
