/* global Pretender, authenticateSession, invalidateSession, login */

import Ember from 'ember';
import {test} from 'ember-qunit';
import startApp from '../helpers/start-app';

var App;

module('Integration: Login Flow', {
    setup: function () {
        App = startApp();
    },
    teardown: function () {
        var applicationRoute = App.__container__.lookup('route:application');
        Ember.run(function () {
            applicationRoute.store.unloadAll('device');
            applicationRoute.store.unloadAll('user');
        });
        Ember.run(App, App.destroy);
    },
});

test('users can log in', function () {
    expect(2);
    visit('/');

    andThen(function () {
        equal(find('button:contains("Login")').length, 1, 'The page shows a login button when the session is not authenticated');
    });

    login();

    andThen(function () {
        equal(find('a:contains("Sign Out")').length, 1, 'The page shows a logout link when the session is authenticated');
    });
});