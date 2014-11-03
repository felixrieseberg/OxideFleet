/* jshint node: true */

module.exports = function (environment) {
    var ENV = {
        modulePrefix: 'nitrous',
        environment: environment,
        baseURL: '/',
        locationType: 'auto',
    };

    ENV['torii'] = {
        providers: {
            'google-oauth2': {
                apiKey: '',
                redirectUri: 'http://localhost:4200'
            },
            'facebook-oauth2': {
                apiKey:      '',
                redirectUri: 'http://localhost:4200'
            }
        }
    };

    ENV['simple-auth'] = {
        routeAfterAuthentication: 'dashboard',
        routeIfAlreadyAuthenticated: 'dashboard'
    };

    ENV['cordova'] = {
        // Rebuild the cordova project on file changes. Blocks the server until it's
        // finished.
        //
        // default: false
        rebuildOnChange: true,

        // Run the cordova emulate command after the build is finished
        //
        // default: false
        emulate: true,

        // Which platform to build and/or emulate
        //
        // default: 'ios'
        platform: 'ios',

        // Which URL the ember server is running on. This is used when using
        // live-reload that comes with the starter kit.
        //
        // default: 'the-device-ip:4200'
        emberUrl: 'http://10.0.1.12:4200',

        // Whether or not to use liveReload on the device simulator. Requires a few
        // plugins to be installed that come with the starter-kit. It will cause your
        // app to not boot up in the browser
        //
        // default: false and iOS
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
    }

    if (environment === 'production') {

    }

    return ENV;
};
