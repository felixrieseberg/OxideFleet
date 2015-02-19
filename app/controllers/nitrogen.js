import Ember from 'ember';

export default Ember.Controller.extend({
    needs: 'application',
    appController: Ember.computed.alias('controllers.application'),
    subscribeToNitrogen: false,

    actions: {
        createNewDevice: function (options) {
            var appController = this.get('appController'),
                nitrogenService = appController.get('nitrogenService'),
                currentUsers = appController.get('currentUser'),
                apikey = currentUsers.content.get('api_key'),
                newDevice;

            if (apikey) {
                options = _.defaults(options, {
                    nickname: 'OxideDevice',
                    name: 'Oxide Device',
                    tags: ['oxide'],
                    api_key: apikey
                });

                newDevice = new nitrogen.Device(options);
                nitrogenService.connect(newDevice, function (err, session, principal) {
                    console.log(session, principal);
                });
            }
        },

        subscribeToNitrogen: function (originalController, callback) {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession');

            if (this.get('subscribedToNitrogen') || !nitrogenSession) {
                return;
            }

            nitrogenSession.onMessage({
                $or: [
                    { type: 'location' }
                ]
            }, function (message) {
                originalController.send(callback, message);
            });

            this.set('subscribedToNitrogen', true);
        },

        getLastMessage: function (principalId, messageLimit, originalController, callback) {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession'),
                limit = (messageLimit) ? messageLimit : 0;

            if (nitrogenSession && principalId) {
                nitrogen.Message.find(nitrogenSession, { type: 'location', from: principalId }, { sort: { ts: -1 }, limit: limit },
                    function (err, locations) {
                        if (err) {
                            return;
                        }
                        originalController.send(callback, locations, principalId);
                    }
                );
            }
        }
    }

});
