/* global Pretender, authenticateSession, invalidateSession, login */

import Ember from 'ember';
import {test} from 'ember-qunit';
import startApp from '../helpers/start-app';

var App;

module('Integration: Dashboard', {
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

test('Dashboard shows device card', function () {
    expect(1);
    visit('/');
    login();
    
    andThen(function () {
        equal(find('h4.flatpanel-name').length, 1, 'A device is displayed');
    });
});