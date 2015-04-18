/* global Microsoft */

import Ember from 'ember';

export default Ember.Component.extend({

    zoom: 6,
    showDashboard: false,

    setup: function () {
        var map = new Microsoft.Maps.Map(document.getElementById('map'), {
            center: new Microsoft.Maps.Location(30, 0),
            credentials: 'Akbhia6_9IoahE9Q2TyAVORP_IHbhkxmTiy25f8WXYpnt_pzIA0AhgvyDVHKJkhi',
            enableSearchLogo: false,
            zoom: this.get('zoom'),
            showDashboard: this.get('showDashboard')
        });

        this.set('mapReference', map);
    }.on('didInsertElement')

});
