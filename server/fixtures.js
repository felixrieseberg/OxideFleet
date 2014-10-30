var fixtures = {};

fixtures.waterheaters = [{
        "id": 1,
        "name": "Waterheater Guest",
        "status": true,
        "public_key": "",
        "fahrenheit": 105,
        "targetFahrenheit": 95,
        "kilowatt": 24,
        "powerConsumption": 88,
        "location": 1,
        "image": "room1.jpg",
        "temperatureHistory": "temperatureHistory.png",
        "lastUpdated": Date.now(),
        "sleepmode": false,
        "vacationmode": false,
        "cloudsync": true,
        "preset": 1
    },
    {
        "id": 2,
        "name": "Waterheater Bedroom",
        "status": false,
        "public_key": "",
        "fahrenheit": 102,
        "targetFahrenheit": 106,
        "kilowatt": 23,
        "powerConsumption": 66,
        "location": 2,
        "image": "room2.jpg",
        "temperatureHistory": "temperatureHistory.png",
        "lastUpdated": Date.now(),
        "sleepmode": false,
        "vacationmode": true,
        "cloudsync": true,
        "preset": null,
    },
    {
        "id": 3,
        "name": "Waterheater Den",
        "status": false,
        "public_key": "",
        "fahrenheit": 85,
        "targetFahrenheit": 90,
        "kilowatt": 21,
        "powerConsumption": 44,
        "location": 3,
        "image": "room3.jpg",
        "temperatureHistory": "temperatureHistory.png",
        "lastUpdated": Date.now(),
        "sleepmode": true,
        "vacationmode": false,
        "cloudsync": false,
        "preset": 3
    }];

fixtures.locations = [{
        "id": 1,
        "name": "Guestroom",
        "waterheaters": [1]
    },
    {
        "id": 2,
        "name": "Washroom",
        "waterheaters": [2]
    },
    {
        "id": 3,
        "name": "Bedroom",
        "waterheaters": [3]
    }];

fixtures.presets = [{
        "id": 1,
        "name": "Veronica",
        "fahrenheit": 95,
        "minutes": 5,
        "selectedDays": ["Monday", "Wednesday", "Friday"]
    },
    {
        "id": 2,
        "name": "Daniela",
        "fahrenheit": 98,
        "minutes": 7,
        "selectedDays": ["Wednesday", "Friday", "Saturday"]
    },
    {
        "id": 3,
        "name": "John",
        "fahrenheit": 104,
        "minutes": 10,
        "selectedDays": ["Monday", "Wednesday", "Friday", "Sunday"]
    }];

fixtures.devices = fixtures.waterheaters;

module.exports = fixtures;