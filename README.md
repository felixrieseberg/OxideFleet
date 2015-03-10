# Oxide Fleet: Management for the Connected Car [![Build Status](https://travis-ci.org/felixrieseberg/OxideFleet.svg)](https://travis-ci.org/felixrieseberg/OxideFleet)

This folder contains the source for the client application displaying information about the 'Connected Car'. It's built with Ember Cli and contains a clean build pipeline, asset management, and unit/functional testing. It's pretty heavily WIP - you probably don't need anything in here if you just stumbled in here.

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
