import Ember from 'ember';

export default Ember.View.extend({
    setupSidebar: function () {
        var self = this;

        $('#sidebar-container').swipe({
            swipeLeft: function () {
                self.get('controller').send('toggleSidebar');
            },
            threshold: 20
        });
    }.on('didInsertElement')
});
