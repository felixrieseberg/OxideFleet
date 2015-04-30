import Ember from 'ember';
import DS from 'ember-data';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import jsonApiAdapter from './adapters/jsonapi';
import jsonSerializer from './serializers/jsonapi';
import lsAdapter from './adapters/localstorage';
Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  // Ember CLI sets up routing such that it expects every
  // adapter to match the model name OR that your application
  // adapter is set. Since we want to use 2 adapters some
  // using the local storage others using the rest api, we need
  // to handle the routing of these things ourselves.
  Resolver: Resolver.extend({
        resolveAdapter: function (parsedName) {
            if (parsedName.name === 'application' ||
                parsedName.name === 'device' ||
                parsedName.name === 'user') {
                // Return the default app adapter - local storage
                return App.ApplicationAdapter;
            } else {
                // Return the json api adapter
                return App.JsonApiAdapter;
            }
        },

        resolveSerializer: function (parsedName) {
            if (parsedName.name === 'event' ||
                parsedName.name === 'location' ||
                parsedName.name === 'trip' ||
                parsedName.name === 'driver' ||
                parsedName.name === 'vehicle') {
                // return the json api serializer
                return jsonSerializer.extend(DS.EmbeddedRecordsMixin, {
                    attrs: {
                        // tell the serializer that these attribute
                        // names are always expected to be embedded
                        // in the doc, and not linked
                        event: {embedded: 'always'},
                        location: {embedded: 'always'},
                        tripEvents: {embedded: 'always'}
                    }
                });
            } else {
                // do what you would have normally done
                return this._super(parsedName);
            }
        }
    })
});

var jsonAdapter;

if (config.environment === 'development' ||
    config.environment === 'test') {
    jsonAdapter = jsonApiAdapter.extend({
        host: 'http://localhost:3000'
    });
} else {
    jsonAdapter = jsonApiAdapter.extend({
        host: 'http://nitrogen.io'
    });
}

var localStorageAdapter = lsAdapter.reopenClass({
    serializer: DS.LSSerializer.extend()
});

App.ApplicationAdapter = localStorageAdapter;
App.JsonApiAdapter = jsonAdapter;

loadInitializers(App, config.modulePrefix);

export default App;
