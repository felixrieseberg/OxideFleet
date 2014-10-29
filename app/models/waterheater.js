import DS from 'ember-data';
import Device from './device';

var Waterheater = Device.extend({
    fahrenheit: DS.attr('number'),
    kilowatt: DS.attr('number'),
    powerConsumption: DS.attr('number'),
    image: DS.attr('string')
});

Waterheater.reopenClass({
    FIXTURES: [
        {
            id: 1,
            name: "Waterheater Guest",
            status: true,
            public_key: "",
            fahrenheit: 105,
            kilowatt: 24,
            powerConsumption: 88,
            image: "room1.jpg"
        },
        {
            id: 2,
            name: "Waterheater Bedroom",
            status: false,
            public_key: "",
            fahrenheit: 102,
            kilowatt: 23,
            powerConsumption: 66,
            image: "room1.jpg"
        }
    ]
});

export default Waterheater;
