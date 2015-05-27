/* jshint node: true */

module.exports = function(environment) {
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
      },
      // TODO: Fill in with the correct address
      // Also - make sure we add CORS rules for this host
      API_HOST: 'http://connected-car-api.azurewebsites.net'
    },
    
    sassOptions: {
      includePaths: ['bower_components/materialize/sass', 'bower_components/open-sans-fontface']
    },

    /*jshint -W109 */
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'unsafe-inline' 'self' https://cdn.mxpnl.com https://api.nitrogen.io http://dev.virtualearth.net http://ecn.dev.virtualearth.net", // Allow scripts from https://cdn.mxpnl.com
      'font-src': "'self' http://fonts.gstatic.com", // Allow fonts to be loaded from http://fonts.gstatic.com
      'connect-src': "'self' https://messaging-production.nitrogen.io:4200 https://messaging-production.nitrogen.io wss://messaging-production.nitrogen.io https://api.mixpanel.com https://api.nitrogen.io http://demo2736407.mockable.io http://connected-car-api.azurewebsites.net", // Allow data (ajax/websocket) from api.mixpanel.com and custom-api.local
      'img-src': "'self' http://*.virtualearth.net",
      'style-src': "'self' 'unsafe-inline' http://ecn.dev.virtualearth.net http://fonts.googleapis.com", // Allow inline styles and loaded CSS from http://fonts.googleapis.com 
      'media-src': "'self'",
      'object-src': "'self'"
    }
    /*jshint +W109 */
  };

  

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.API_HOST = 'http://localhost:3000';
    ENV.APP.rootElement = '#ember-testing';
  }

  ENV['simple-auth'] = {
      routeAfterAuthentication: 'dashboard',
      routeIfAlreadyAuthenticated: 'dashboard'
  };

/*
  if (environment === 'production') {
  }

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }
*/
  return ENV;
};
