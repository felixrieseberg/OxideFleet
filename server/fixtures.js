var fixtures = {};

fixtures.waterheaters = [{
        "id": 1,
        "name": "Waterheater Guest",
        "status": true,
        "public_key": "",
        "fahrenheit": 105,
        "kilowatt": 24,
        "powerConsumption": 88,
        "location": 1,
        "image": "room1.jpg"
    },
    {
        "id": 2,
        "name": "Waterheater Bedroom",
        "status": false,
        "public_key": "",
        "fahrenheit": 102,
        "kilowatt": 23,
        "powerConsumption": 66,
        "location": 2,
        "image": "room2.jpg"
    },
    {
        "id": 3,
        "name": "Waterheater Den",
        "status": false,
        "public_key": "",
        "fahrenheit": 85,
        "kilowatt": 21,
        "powerConsumption": 44,
        "location": 3,
        "image": "room3.jpg"
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

fixtures.devices = fixtures.waterheaters;

module.exports = fixtures;