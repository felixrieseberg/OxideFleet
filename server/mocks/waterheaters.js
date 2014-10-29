module.exports = function(app) {
    var express = require('express');
    var waterheatersRouter = express.Router();
    var waterheaters = [{
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

    waterheatersRouter.get('/', function(req, res) {
        res.send({ "waterheaters": waterheaters });
    });

    waterheatersRouter.get('/1', function(req, res) {
        res.send({ "waterheaters": waterheaters[0] });
    });

    waterheatersRouter.get('/2', function(req, res) {
        res.send({ "waterheaters": waterheaters[1] });
    });

    waterheatersRouter.get('/3', function(req, res) {
        res.send({ "waterheaters": waterheaters[2] });
    });

    app.use('/api/waterheaters', waterheatersRouter);
};
