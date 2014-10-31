import Ember from 'ember';

export default Ember.ObjectController.extend({

    title: function () {
        return this.get('model').get('name');
    }.property(),

    celsius: function () {
        return Math.round((this.get('fahrenheit') - 32) * (5/9) * 100) / 100;
    }.property('fahrenheit'),

    targetCelsius: function () {
        return Math.round((this.get('targetFahrenheit') - 32) * (5/9) * 100) / 100;
    }.property('targetFahrenheit'),

    lastUpdatedReadable: function () {
        var format = 'MMMM Do, h:mm:ss a',
            updated = this.get('lastUpdated');

        return moment(updated).format(format);
    }.property('lastUpdated'),

    presets: function () {
        return this.store.find('preset');
    }.property(),

    actions: {
        selectNewPreset: function (preset) {
            if (!preset) {
                return this.set('preset', null);
            }

            var newPreset = this.store.getById('preset', preset.id);
            this.set('preset', newPreset);
        },

        save: function (device) {
            device.save();
        }
    }

});
