import Ember from 'ember';

export function prettyDate (timestamp) {
    return (moment(timestamp)).calendar();
}

export default Ember.Handlebars.makeBoundHelper(prettyDate);
