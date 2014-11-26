import App from '../app';
import DS from 'ember-data';

App.ApplicationSerializer = DS.LSSerializer.extend();
export default DS.LSAdapter.extend({
    namespace: 'oxide'
});

// Rest Adapter, calling http://[HOST]/api/model/id
// -------------------------------------------------
// export default DS.RESTAdapter.extend({
//     namespace: 'api'
// });

// Want to use fixutes instead of the mock rest api?
// Uncomment the line below and comment out the
// DS.RestAdapter above!
// -------------------------------------------------
// export default DS.FixtureAdapter.extend();
