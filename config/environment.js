/* jshint node: true */

module.exports = function (environment) {
    var ENV = {
        modulePrefix: 'oxide',
        environment: environment,
        baseURL: '/',
        locationType: 'hash',

        EmberENV: {
          FEATURES: {
            // Here you can enable experimental features on an ember canary build
            // e.g. 'with-controller': true
          }
        },

        APP: {
          // Here you can pass flags/options to your application instance
          // when it is created
          nitrogen: {
            host: 'api.nitrogen.io',
            protocol: 'https',
            http_port: 443,
            log_levels: ['warn', 'error']
          }
        },
      };


    ENV['simple-auth'] = {
        routeAfterAuthentication: 'dashboard',
        routeIfAlreadyAuthenticated: 'dashboard'
    };

    ENV['cordova'] = {
        // Rebuild the cordova project on file changes. Blocks the server until it's
        // finished.
        rebuildOnChange: true,

        // Run the cordova emulate command after the build is finished
        emulate: false,

        // Which platform to build and/or emulate
        platform: 'ios',

        // Which URL the ember server is running on. This is used when using
        // live-reload that comes with the starter kit.
        emberUrl: 'http://10.0.1.12:4200',

        // Whether or not to use liveReload on the device simulator. Requires a few
        // plugins to be installed that come with the starter-kit. It will cause your
        // app to not boot up in the browser
        liveReload: {
            enabled: false,
            platform: 'ios'
        }
    };


    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        ENV.APP.LOG_ACTIVE_GENERATION = true;
        ENV.APP.LOG_TRANSITIONS = true;
        ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        ENV.APP.LOG_VIEW_LOOKUPS = true;
        ENV.contentSecurityPolicyHeader = 'Disabled-Content-Security-Policy';
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.baseURL = '/';
        ENV.locationType = 'auto';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';

        ENV['simple-auth'] = {
            store: 'simple-auth-session-store:ephemeral'
        }
    }

    if (environment === 'production') {

    }

    return ENV;
};
