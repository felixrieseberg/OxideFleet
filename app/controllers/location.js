import Ember from 'ember';

export default Ember.ObjectController.extend({
    title: function () {
        return this.get('model').get('name');
    }.property()
});
