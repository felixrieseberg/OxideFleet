import Ember from 'ember';
import mobile from '../utils/mobile';

export default Ember.View.extend({
    setupSidebar: function () {
        var self = this;

        if (mobile) {
            $('#sidebar-container').css({
               left: '-250px'
            });
            $('#main-content').css({
               marginLeft: '0px'
            });
            $('#navbar').css({
               marginLeft: '0px'
            });
        }

        $('#sidebar-container').swipe({
            swipeLeft: function () {
                self.get('controller').send('toggleSidebar');
            },
            threshold: 20
        });

    }.on('didInsertElement')
});
