module.exports = function(app) {
    var express = require('express');
    var waterheatersRouter = express.Router();
    var waterheaters = require('../fixtures').waterheaters;

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
