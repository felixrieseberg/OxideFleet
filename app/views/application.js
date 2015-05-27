import Ember from 'ember';

export default Ember.View.extend({
    removeLoader: function () {
        var $loader = $('.background-loader');

        if ($loader.length) {
            $loader.remove();
        }
    }.on('didInsertElement')
});
