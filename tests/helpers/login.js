import Ember from 'ember';

Ember.Test.registerAsyncHelper('login', function (app) {
    var applicationRoute = app.__container__.lookup('route:application');

    console.log('Login Called');

    Ember.run(function(){
        var user = applicationRoute.store.createRecord('user', {
            id: 'me',
            name: 'John Doe',
            email: 'john@doe.com',
            api_key: '5364e5c4213164980496dfd9',
            created_at: '2014-11-13T18:42:34.881Z',
            nitrogen_id: '6463fb9a45dds4ca04665422',
            last_connection: '2015-02-12T23:57:33.426Z',
            last_ip: '167.220.27.125',
            nickname: 'current',
            password: 'p@ssword',
            updated_at: '2015-02-09T17:55:11.975Z'
        });

        user = user.save();

        var device = applicationRoute.store.createRecord('device', {
            nitrogen_id: '5473b717e6b804c5040dda3b',
            name: 'Test Device',
            status: false,
            lastUpdated: null,
            last_connection: '2015-02-12T23:57:33.426Z',
            last_ip: '167.220.27.125',
            nickname: 'default',
            created_at: '2015-01-09T17:55:11.975Z',
            updated_at: '2015-02-09T17:55:11.975Z',
            type: 'device',
            owner: user
        });

        device.save();

        authenticateSession();
    });
});