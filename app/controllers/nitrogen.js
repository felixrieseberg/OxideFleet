import Ember from 'ember';

export default Ember.Controller.extend({
    needs: 'application',
    appController: Ember.computed.alias('controllers.application'),
    subscribeToNitrogen: false,

    actions: {
        /**
         * Subcribes to the Nitrogen Socket Message Stream, calling a
         * callback on a given controller
         * @param  {Controller}   originalController - The controller on which to call the callback
         * @param  {string}       callback - The callback (passed as a string, since called via Ember Run Loop)
         */
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

        /**
         * Gets the last message for a given car from Nitrogen
         * @param  {string}       principalId        - Id of the car for which the last message shall be retreived
         * @param  {number}       messageLimit       - Number of last messages to retreive (usually 1)
         * @param  {Controller}   originalController - The controller on which to call the callback
         * @param  {string}       callback           - The callback (passed as a string, since called via Ember Run Loop)
         */
        getLastMessage: function (principalId, messageLimit, originalController, callback) {
            var appController = this.get('appController'),
                nitrogenSession = appController.get('nitrogenSession'),
                limit = (messageLimit) ? messageLimit : 0;

            if (nitrogenSession && principalId) {
                nitrogen.Message.find(nitrogenSession, {
                    type: 'location', from: principalId
                },
                {
                    sort: { ts: -1 },
                    limit: limit
                }, function (err, locations) {
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
