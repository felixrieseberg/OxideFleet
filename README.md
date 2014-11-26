# Oxide [![Build Status](https://travis-ci.org/nitrogenjs/oxide.svg)](https://travis-ci.org/nitrogenjs/oxide)
This is a bootstrapped app for device-managemet 'Internet of Things' apps using Nitrogen. It's based on Cordova and Ember-Cli and should be considered  a 'starting point' rather than a production-ready application. The following key elements are included:

- Full client MVC architecture with Models, Views and Controllers for IoT Devices with properties, with automatic binding to a REST API.
- A mock-http server for said API is included to illustrate how the data flow works.
- Authorization flow (based on ember-simple-auth), allowing for both OAuth2 as well as custom authorization against a custom or major provider. Facebook and Google as authentication providers are included.
- UI/UX based on Bootstrap and FlatUI. It look's pretty good, but will likely need some work around the rough edges.

![Screenshot](https://raw.githubusercontent.com/irjudson/oxide/master/.screenshot.png)

## Development
You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM). *v0.11.14 is heavily recommended*
* [Bower](http://bower.io/)
* [Cordova](http://cordova.apache.org/)
* [Cordova Icon](https://www.npmjs.org/package/cordova-icon)

### Installation
* `git clone <repository-url>` this repository
* `cd oxide`
* `npm install`
* `bower install`

### Running / Development
The included live-development server has automatically reloads on file changes can be started with the following command.
* cp config/environment.template.js config/environement.js`
* `ember serve`
* Visit your app at http://localhost:4200.

Running ember in development mode will also fire up the development Node server with a Mock API, responding to `/api/` calls with JSON data as outlined in `./server/fixtures.js`. It's important to note that this server is a development server only - while the app itself is intended to bootstrap a production app, the server component is not.

### Code Generators
Make use of the many generators for code, try `ember help generate` for more details or visit the [ember-cli guide](http://www.ember-cli.com/).

#### Building
* `ember build` (development)
* `ember build --environment production` (production)

#### Tests
The tests are currently stubs; fully fledged testing suites should be created once the key components (models, controllers, view behaviour) has been fledged out.

* `ember test`
* `ember test --server`
