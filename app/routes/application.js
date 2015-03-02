import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {

    actions: {
        sessionInvalidationSucceeded: function () {
            // Force reload to empty all cached data
            window.location = 'http://' + document.location.host;
        },

        toggleSidebar: function () {
            var width = $('#sidebar-container').width();
            var slideOut = ($('#sidebar-container').css('left') !== '-'+width+'px') ? true : false;
            var rightIndent = '0px';

            if (slideOut === true) {
                $('#sidebar-container').animate({
                    left: -width
                }, { duration: 200, queue: false });
                $('#main-container').animate({
                    marginLeft: '0px',
                    marginRight: '0px'
                }, { duration: 200, queue: false });
                $('#navbar').animate({
                    marginLeft: '0px',
                    marginRight: '0px'
                }, { duration: 200, queue: false });
            } else {
                $('#sidebar-container').animate({
                    left: '0px'
                }, { duration: 200, queue: false });
                $('#main-container').animate({
                    marginLeft: width,
                    marginRight: rightIndent
                }, { duration: 200, queue: false });
                $('#navbar').animate({
                    marginLeft: width,
                    marginRight: rightIndent
                }, { duration: 200, queue: false });
            }
        }
    }

});
