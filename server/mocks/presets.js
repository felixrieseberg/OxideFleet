module.exports = function(app) {
    var express = require('express');
    var presetsRouter = express.Router();
    var presets = require('../fixtures').presets;

    presetsRouter.get('/', function(req, res) {
        res.send({ "presets": presets });
    });

    presetsRouter.get('/1', function(req, res) {
        res.send({ "presets": presets[0] });
    });

    presetsRouter.get('/2', function(req, res) {
        res.send({ "presets": presets[1] });
    });

    presetsRouter.get('/3', function(req, res) {
        res.send({ "presets": presets[2] });
    });

    app.use('/api/presets', presetsRouter);
};
