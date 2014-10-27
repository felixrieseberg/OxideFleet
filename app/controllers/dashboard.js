import Ember from 'ember';

export default Ember.Controller.extend({

    title: 'Dashboard',
    model: function () {
        return this.store.find('waterheater');
    },

    actions: {

    }

});
