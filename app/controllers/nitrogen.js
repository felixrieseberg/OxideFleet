import Ember from 'ember';

export default Ember.Controller.extend({
    needs: 'application',
    appController: Ember.computed.alias('controllers.application'),
    subscribeToNitrogen: false,

    actions: {
        subscribeToNitrogen: function (originalController, callback) {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession');

            if (this.get('subscribedToNitrogen') || !nitrogenSession) {
                return;
            }

            nitrogenSession.onMessage({ type: 'location' }, message => {
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
