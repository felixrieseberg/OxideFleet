import Ember from 'ember';

export default Ember.ObjectController.extend({

    title: function () {
        return this.get('model').get('name');
    }.property(),

    celsius: function () {
        return Math.round((this.get('fahrenheit') - 32) * (5/9) * 100) / 100;
    }.property('fahrenheit'),

    lastUpdatedReadable: function () {
        var format = 'MMMM Do, h:mm:ss a',
            updated = this.get('lastUpdated');

        return moment(updated).format(format);
    }.property('lastUpdated')

});
