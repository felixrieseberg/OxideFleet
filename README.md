# Oxide Fleet: Management for the Connected Car [![Build Status](https://travis-ci.org/felixrieseberg/OxideFleet.svg)](https://travis-ci.org/felixrieseberg/OxideFleet)

This folder contains the source for the client application displaying information about the 'Connected Car'. It's built with Ember Cli and contains a clean build pipeline, asset management, and unit/functional testing. It's pretty heavily WIP - you probably don't need anything in here if you just stumbled in here.

## Preview
A preview of the tool is available [here](http://tedconnectedcar.azurewebsites.net), which is automatically built and deployed from master. 

## Development
You will need the following things properly installed on your computer. If you're developing in Windows, make use of the documentation and the tools we wrote for developing [Ember Cli apps on Windows](http://www.ember-cli.com/#windows). In particular, you might want to install [ember-cli-windows](https://github.com/felixrieseberg/ember-cli-windows) to improve build speed performance. Additional performance can be gained by using an elevated prompt, which can be achieved by starting PowerShell or CMD ‘as Administrator’.

If you have none of the tools outlined below, consider using the amazing [Chocolatey](http://chocolatey.org) to make the installation of those tools a lot easier.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM).
* [Bower](http://bower.io/)

### Development Hints
* Nitrogen will attempt to call itself on the same port the host is running on. Unless you're developing with `ember serve --port 80`, Nitrogen won't be able to get in touch with the mothership. If the app is started with `ember serve`, live tracking will therefore not work.

### Installation
* `git clone https://github.com/felixrieseberg/OxideFleet.git` this repository
* `cd OxideFleet`
* `npm install`
* `bower install`

### Running / Development
The included live-development server has automatically reloads on file changes can be started with the following command.
* `ember serve`
* Visit the at http://localhost:4200.

### Code Generators
Make use of the many generators for code, try `ember help generate` for more details or visit the [ember-cli guide](http://www.ember-cli.com/).

#### Building
* `ember build` (development)
* `ember build --environment production` (production)

#### Tests
Integration and unit tests can be run with `ember test`; use `ember test --server` if you'd like to test continuously during development. Code style and good JavaScript practices are enforced via JSHint and JSCS, use `grunt test` to run those tools.
