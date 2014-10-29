module.exports = function(app) {
    var express = require('express');
    var locationsRouter = express.Router();
    var locations = [
        {
            "id": 1,
            "name": "Guestroom"
        },
        {
            "id": 2,
            "name": "Washroom"
        },
        {
            "id": 3,
            "name": "Bedroom"
        }
        ];

    locationsRouter.get('/', function(req, res) {
        res.send({ "locations": locations });
    });

    locationsRouter.get('/1', function(req, res) {
        res.send({"location": locations[0] });
    });

    locationsRouter.get('/2', function(req, res) {
        res.send({"location": locations[1] });
    });

    locationsRouter.get('/3', function(req, res) {
        res.send({"location": locations[0] });
    });

    app.use('/api/locations', locationsRouter);
};
