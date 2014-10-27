import DS from 'ember-data';
import Device from './device';

var Waterheater = Device.extend({
    fahrenheit: DS.attr('number'),
    kilowatt: DS.attr('number')
});

Waterheater.reopenClass({
    FIXTURES: [
        {
            id: 1,
            name: "Waterheater Guest",
            status: true,
            public_key: "",
            fahrenheit: 105,
            kilowatt: 24
        },
        {
            id: 2,
            name: "Waterheater Bedroom",
            status: false,
            public_key: "",
            fahrenheit: 102,
            kilowatt: 23
        }
    ]
});

export default Waterheater;
