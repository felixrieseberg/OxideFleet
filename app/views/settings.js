import Ember from 'ember';

export default Ember.View.extend({
    showConfigString: false,

    actions: {
        toggleShowConfig: function () {
            this.toggleProperty('showConfigString');
        }
    }
});
