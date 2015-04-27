/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

var app;

// brocfile-env module hasn't been decided on how to expose more build options

app = new EmberApp();

app.import('vendor/api_mocks/nitrogen.js', {prepend: true});
app.import('vendor/api_mocks/microsoft-maps.js', {prepend: true});
module.exports = app.toTree();
