import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    namespace: 'api'
});

// Want to use fixutes instead of the mock rest api?
// Uncomment the line below and comment out the
// DS.RestAdapter above!
// -------------------------------------------------
// export default DS.FixtureAdapter.extend();