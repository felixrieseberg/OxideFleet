import Ember from 'ember';
import mobile from '../utils/mobile';

export default Ember.View.extend({
    sidebarMobile: function () {
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
    }.on('didInsertElement')
});
