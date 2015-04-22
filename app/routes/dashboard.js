import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    model: function () {
        return this.store.find('device');
    },

    actions: {
        toggleSideNav: function () {
            var $container = Ember.$('.main-container'),
                $containerMargin = $container.css('margin-left');

            // If the menu isn't out, pull it out
            if ($containerMargin !== '250px') {
                $container.animate({'margin-left': '250px'}, { duration: 200, queue: false});
            } else {
                $container.animate({'margin-left': '50px'}, { duration: 200, queue: false});
            }

        }
    }
});
