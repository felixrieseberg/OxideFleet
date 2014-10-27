import DS from 'ember-data';
import Device from './device';

var Waterheater = Device.extend({
    fahrenheit: DS.attr('number'),
    kilowatt: DS.attr('number')
});

Waterheater.reopenClass({
    FIXTURES: [
        { 
            name: 'Waterheater 1',
            status: true,
            public_key: '',
            fahrenheit: 105,
            kilowatt: 24
        },
    ]
})

export default Waterheater;
