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
// 
// 
app.import('bower_components/bootstrap/dist/js/bootstrap.js');
app.import('bower_components/bootstrap/dist/css/bootstrap.css');
app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', { destDir: 'fonts' });
app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', { destDir: 'fonts' });

app.import('bower_components/selectize/dist/js/standalone/selectize.js');
app.import('bower_components/selectize/dist/css/selectize.css');

app.import('bower_components/flat-ui/dist/css/flat-ui.css');
app.import('bower_components/flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.woff', { destDir: 'fonts/glyphicons' });
app.import('bower_components/flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.ttf', { destDir: 'fonts/glyphicons' });

app.import('bower_components/flat-ui/dist/fonts/lato/lato-regular.woff', { destDir: 'fonts/lato' });
app.import('bower_components/flat-ui/dist/fonts/lato/lato-regular.ttf', { destDir: 'fonts/lato' });
app.import('bower_components/flat-ui/dist/fonts/lato/lato-bold.woff', { destDir: 'fonts/lato' });
app.import('bower_components/flat-ui/dist/fonts/lato/lato-bold.ttf', { destDir: 'fonts/lato' });

app.import('bower_components/moment/min/moment-with-locales.js');
app.import('bower_components/rangeslider.js/dist/rangeslider.min.js');
app.import('bower_components/bootstrap-switch/dist/js/bootstrap-switch.min.js');
app.import('bower_components/bootstrap-select/dist/css/bootstrap-select.min.css');
app.import('bower_components/bootstrap-select/dist/js/bootstrap-select.js');
app.import('bower_components/JavaScript-MD5/js/md5.js');
app.import('bower_components/jquery-touchswipe/jquery.touchSwipe.min.js');

app.import('bower_components/underscore/underscore-min.js', {
  'underscore': [
    'default'
  ]
});

module.exports = app.toTree();
