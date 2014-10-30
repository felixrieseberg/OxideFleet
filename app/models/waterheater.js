import DS from 'ember-data';
import Device from './device';

var Waterheater = Device.extend({
    fahrenheit: DS.attr('number'),
    kilowatt: DS.attr('number'),
    powerConsumption: DS.attr('number'),
    image: DS.attr('string'),
    temperatureHistory: DS.attr('string'),

    // Since this is mostly an example app,
    // we can be bullish and just poll the
    // server every few seconds.
    // Also, the 'updated time' is clearly
    // a hack.
    didLoad: function () {
        var self = this;

        setInterval(function () { 
            self.reload()
            self.set('lastUpdated', Date.now());
        }, 1000);
    }
});

export default Waterheater;
