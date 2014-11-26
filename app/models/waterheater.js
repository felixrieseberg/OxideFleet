import DS from 'ember-data';
import Device from './device';

var Waterheater = Device.extend({
    fahrenheit: DS.attr('number'),
    targetFahrenheit: DS.attr('number'),
    kilowatt: DS.attr('number'),
    powerConsumption: DS.attr('number'),
    image: DS.attr('string'),
    temperatureHistory: DS.attr('string'),
    preset: DS.belongsTo('preset', {async: true}),

    sleepmode: DS.attr('boolean'),
    vacationmode: DS.attr('boolean'),
    cloudsync: DS.attr('boolean')
});

export default Waterheater;
