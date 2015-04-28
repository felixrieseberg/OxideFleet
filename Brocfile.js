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
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Light/OpenSans-Light.eot', {destDir: 'assets/fonts/Light'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Light/OpenSans-Light.svg', {destDir: 'assets/fonts/Light'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Light/OpenSans-Light.ttf', {destDir: 'assets/fonts/Light'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Light/OpenSans-Light.woff', {destDir: 'assets/fonts/Light'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Light/OpenSans-Light.woff2', {destDir: 'assets/fonts/Light'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Regular/OpenSans-Regular.eot', {destDir: 'assets/fonts/Regular'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Regular/OpenSans-Regular.svg', {destDir: 'assets/fonts/Regular'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Regular/OpenSans-Regular.ttf', {destDir: 'assets/fonts/Regular'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Regular/OpenSans-Regular.woff', {destDir: 'assets/fonts/Regular'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Regular/OpenSans-Regular.woff2', {destDir: 'assets/fonts/Regular'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Bold/OpenSans-Bold.eot', {destDir: 'assets/fonts/Bold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Bold/OpenSans-Bold.svg', {destDir: 'assets/fonts/Bold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Bold/OpenSans-Bold.ttf', {destDir: 'assets/fonts/Bold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Bold/OpenSans-Bold.woff', {destDir: 'assets/fonts/Bold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Bold/OpenSans-Bold.woff2', {destDir: 'assets/fonts/Bold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Semibold/OpenSans-Semibold.eot', {destDir: 'assets/fonts/Semibold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Semibold/OpenSans-Semibold.svg', {destDir: 'assets/fonts/Semibold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Semibold/OpenSans-Semibold.ttf', {destDir: 'assets/fonts/Semibold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Semibold/OpenSans-Semibold.woff', {destDir: 'assets/fonts/Semibold'});
app.import( app.bowerDirectory + '/open-sans-fontface/fonts/Semibold/OpenSans-Semibold.woff2', {destDir: 'assets/fonts/Semibold'});

module.exports = app.toTree();
