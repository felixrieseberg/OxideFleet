module.exports = function(app) {
    var express = require('express');
    var devicesRouter = express.Router();
    var devices = require('../fixtures').devices;

    devicesRouter.get('/', function(req, res) {
        res.send({ "devices": devices });
    });

    devicesRouter.get('/1', function(req, res) {
        res.send({ "device": devices[0] });
    });

    devicesRouter.get('/2', function(req, res) {
        res.send({ "device": devices[1] });
    });

    devicesRouter.get('/3', function(req, res) {
        res.send({ "device": devices[2] });
    });

    app.use('/api/devices', devicesRouter);
};
