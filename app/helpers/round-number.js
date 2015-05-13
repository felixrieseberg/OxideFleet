import Ember from 'ember';

/**
 * Takes a number and returns a rounded version
 * @param  {number} input
 * @param  {number} points
 * @return {number}
 */
export function round(input, points) {
    if (points === undefined) {
        points = 2;
    }
    return parseFloat(input).toFixed(points);
}

export default Ember.Handlebars.makeBoundHelper(round);
