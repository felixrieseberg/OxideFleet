import Ember from 'ember';

export default Ember.Controller.extend({
    title: 'Settings',
    needs: ['application'],
    config: Ember.computed.alias('controllers.application.fullConfig'),
    configString: function () {
        return JSON.stringify(this.get('config'), null, '\t');
    }.property('config'),
    connectionSecure: Ember.computed.equal('config.nitrogen.http_port', 'https'),

    localStorageSize: function () {
        var result = 0;

        for (var i = localStorage.length - 1; i >= 0; i =- 1) {
            result = result + ((localStorage[i].length * 2) / 1024 / 1024);
        }

        return result.toFixed(2);
    }.property(),

    actions: {
        clearLocalStorage: function () {
            window.localStorage.clear();
            this.send('invalidateSession');
        }
    }

});
