import Ember from 'ember';
import UnauthenticatedRouteMixin from 'simple-auth/mixins/unauthenticated-route-mixin';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {
    beforeModel : function () {
        this.controllerFor('application').set('hideSidebar', true);
    },

    actions: {
        willTransition: function () {
            this.controllerFor('application').set('hideSidebar', false);
            return true;
        }
    }
});
