import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {

    actions: {
        /**
         * Once the session has been invalidated, we reload the whole page to flush caches
         */
        sessionInvalidationSucceeded: function () {
            // Force reload to empty all cached data
            window.location = 'http://' + document.location.host;
        }
    }

});
