import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    model: function () {
        return this.store.find('device');
    },

    actions: {
        toggleSideNav: function () {
            var $container = Ember.$('.main-container'),
                $menu = Ember.$('.menu-flyout');

            // If the menu isn't out, pull it out
            $container.toggleClass('expanded');
            $menu.toggleClass('expanded');
        }
    }
});
