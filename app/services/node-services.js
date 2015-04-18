import Ember from 'ember';
var azureStorage = null;
var fs = null;
// check if running in nw, if not, we're probably running as a test
// in which case this entire service will be mocked
if (window.requireNode) {
    azureStorage = window.requireNode('azure-storage');
    fs = window.requireNode('fs');
}
export default Ember.Service.extend({
    azureStorage: azureStorage,
    fs: fs,
    getActiveAccount: function (store) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var accounts = store.all('account'),
                length = accounts.get('length'),
                i = 0;
            accounts.forEach(function (account) {
                if (account.get('active') === true) {
                    return Ember.run(null, resolve, account);
                }
                i += 1;
                if (i >= length) {
                    return Ember.run(null, reject, 'could not find any active accounts');
                }
            });
        });
    }
});
