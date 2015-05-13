import Ember from 'ember';

/**
 * Uses Moment to return a pretty date
 * @param  {number} timestamp - Timestamp
 * @return {string}           - Pretty Moment date string
 */
export function prettyDate (timestamp) {
    return (moment(timestamp)).calendar();
}

export default Ember.Handlebars.makeBoundHelper(prettyDate);
