import DS from 'ember-data';
import Device from './device';

export default Device.extend({
    fahrenheit: DS.attr('number'),
    kilowatt: DS.attr('number')
});
