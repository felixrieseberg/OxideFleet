/* global Pretender, authenticateSession, invalidateSession, login */

import Ember from 'ember';
import {test} from 'ember-qunit';
import startApp from '../helpers/start-app';

var App;

module('Integration: Authentication', {
    setup: function () {
        App = startApp();
    },
    teardown: function () {
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

test('a protected route is accessible when the session is authenticated', function () {
    expect(1);
    authenticateSession();
    visit('/dashboard');

    andThen(function () {
        equal(currentRouteName(), 'dashboard');
    });
});

test('a protected route is not accessible when the session is not authenticated', function () {
    expect(1);
    invalidateSession();
    visit('/dashboard');

    andThen(function () {
        notEqual(currentRouteName(), 'dashboard');
    });
});