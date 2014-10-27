module.exports = function(app) {
  var express = require('express');
  var waterheatersRouter = express.Router();
  waterheatersRouter.get('/', function(req, res) {
    res.send({"waterheaters":
        [{
            "id": 1,
            "name": "Waterheater Guest",
            "status": true,
            "public_key": "",
            "fahrenheit": 105,
            "kilowatt": 24,
            "powerConsumption": 88
        },
        {
            "id": 2,
            "name": "Waterheater Bedroom",
            "status": false,
            "public_key": "",
            "fahrenheit": 102,
            "kilowatt": 23,
            "powerConsumption": 66
        }]
    });
  });
  app.use('/api/waterheaters', waterheatersRouter);
};
