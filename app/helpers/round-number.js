import Ember from 'ember';

export function round(input, points) {
    points = points || 2;
    return parseFloat(input).toFixed(points);
}

export default Ember.Handlebars.makeBoundHelper(round);