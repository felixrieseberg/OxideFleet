import Ember from 'ember';

export default Ember.Controller.extend({
    needs: 'application',
    appController: Ember.computed.alias('controllers.application'),
    subscribeToNitrogen: false,

    actions: {
        subscribeToNitrogen: function () {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession'),
                self = this;

            if (this.get('subscribedToNitrogen')) {
                return;
            }

            nitrogenSession.onMessage({
                $or: [{
                    type: 'location'
                }]
            }, function (message) {
                console.log('Message Received. New Location:', message.body);

                self.store.find('device', {
                        nitrogen_id: message.from
                    })
                    .then(function (foundDevices) {
                        var foundDevice;

                        if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                            foundDevice = foundDevices.content[0];
                            // TODO: Process incoming messages
                        }
                    });
            });

            this.set('subscribedToNitrogen', true);
        },

        getMessage: function (principalId, messageLimit) {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession'),
                limit = (messageLimit) ? messageLimit : 0,
                self = this;

            if (nitrogenSession && principalId) {
                nitrogen.Message.find(nitrogenSession, {
                        type: 'location',
                        from: principalId
                    }, {
                        sort: {
                            ts: -1
                        },
                        limit: limit
                    },
                    function (err, locations) {
                        if (err) {
                            return;
                        }

                        if (locations.length > 0) {
                            self.store.find('device', {
                                nitrogen_id: principalId
                            }).then(function (foundDevices) {
                                var foundDevice;

                                if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                                    foundDevice = foundDevices.content[0];

                                    // TODO: Process Messages
                                }
                            });
                        }
                    }
                );
            }
        }
    }

});
