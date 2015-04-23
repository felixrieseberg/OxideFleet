/* global Microsoft */

import Ember from 'ember';

export default Ember.Component.extend({
    zoom: 6,
    showDashboard: false,

    setup: function () {
        // Create map
        var map = new Microsoft.Maps.Map(document.getElementById('map'), {
            center: new Microsoft.Maps.Location(47.669444, -122.123889),
            credentials: 'Akbhia6_9IoahE9Q2TyAVORP_IHbhkxmTiy25f8WXYpnt_pzIA0AhgvyDVHKJkhi',
            enableSearchLogo: false,
            zoom: this.get('zoom'),
            showDashboard: this.get('showDashboard'),
            enableHighDpi: true,
            disableBirdseye: true,
            enableClickableLogo: false,
            inertiaIntensity: 0.5
        });

        // Get current location
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                let options = map.getOptions();

                if (options) {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;
                    options.center = new Microsoft.Maps.Location(lat, lon);
                }

                map.setView(options);
            });
        }

        this.set('mapReference', map);
    }.on('didInsertElement')
});
