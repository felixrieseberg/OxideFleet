import DS from 'ember-data';

var User = DS.Model.extend({
    email: DS.attr('string'),
    password: DS.attr('string'),
    name: DS.attr('string'),
    avatar: DS.attr('string'),
    devices: DS.hasMany('device', { async: true })
});

User.reopenClass({
    FIXTURES: [
        { id: 1, email: 'john@microsoft.com', password: 'password', name: 'John Testuser', avatar: null },
        { id: 2, email: 'mary@microsoft.com', password: 'password', name: 'Mary Testuser', avatar: null },
    ]
});

export default User;