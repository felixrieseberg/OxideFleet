import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    model: function () {
        return this.store.find('device');
    },

    afterModel: function (devices) {
        var promises = [];

        // Preload the vehicles
        for (var i = 0; i < devices.content.length; i = i + 1) {
            promises.push(new Promise(resolve => {
                devices.content[i].get('vehicle').then(() => resolve());
            }));
        }

        return Ember.RSVP.all(promises);
    },

    actions: {
        /**
         * Toggle the side/hamburger navigation
         */
        toggleSideNav: function () {
            var $container = Ember.$('.main-container'),
                $menu = Ember.$('.menu-flyout');

            // If the menu isn't out, pull it out
            $container.toggleClass('expanded');
            $menu.toggleClass('expanded');
        },

        /**
         * Toggle the driver view
         */
        toggleDriverIcon: function () {
            Ember.$('#driversMenuButton').toggleClass('selected');
        },

        /**
         * Toggle the list of vehicles
         */
        toggleVehicleList: function () {
            var $container = Ember.$('.vehicle-list'),
                $icon = Ember.$('.vehicle-list > .card-content > .card-title > i');

            $container.toggleClass('collapsed');

            if ($icon.hasClass('mdi-navigation-expand-less')) {
                $icon.removeClass('mdi-navigation-expand-less');
                $icon.addClass('mdi-navigation-expand-more');
            } else {
                $icon.removeClass('mdi-navigation-expand-more');
                $icon.addClass('mdi-navigation-expand-less');
            }
        }
    }
});
