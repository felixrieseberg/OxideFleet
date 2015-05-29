import Ember from 'ember';

export function timeLength(timestamps) {
    if (timestamps && timestamps.length >= 2) {
        let diff = moment(timestamps[1]).diff(moment(timestamps[0]));
        return moment.duration(diff).humanize();
    }
    return '';
}

export default Ember.HTMLBars.makeBoundHelper(timeLength);
