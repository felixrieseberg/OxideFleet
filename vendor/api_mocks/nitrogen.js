(function () {

    function getMetaContent() {
        var metas = window.document.getElementsByTagName('meta');
        for (var i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute("name") === "oxide/config/environment") {
                return decodeURIComponent(metas[i].getAttribute("content"));
            }
        }

        return "";
    }

    function doAssert(value) {
        var assert = nitrogen.assert;
        if(assert) {
            assert.ok(value);
        }
    }
    var env = JSON.parse(getMetaContent());
    
    if (env.APP.rootElement !== "#ember-testing") {
        return;
    }
    var nitrogen = {
        Service: function Service(config) {
        },
        
        Principal: function Principal() {
            this.user = 'testuser',
            this.name = 'testuser',
            this. email = 'test@microsoft.com',
            this.api_key = 'askjflhawlqkjfh',
            this.password = 'p@ssw0rd',
            this.updated_at = new Date(Date.now()),
            this.created_at = new Date(Date.now() - 3000),
            this.id = 'abc-123'
        }
    };
    
    nitrogen.Principal.find = function (session, options, sortOptions, callback) {
        doAssert(session);
        doAssert(options);
        doAssert(sortOptions);
        doAssert(callback);
        return callback(null, [new nitrogen.Principal()]);
    };
    nitrogen.Service.prototype.resume = function () {
        throw 'not implemented';
    };

    nitrogen.Service.prototype.authenticate = function (user, callback) {
        return callback(null, { 
            principal: new nitrogen.Principal()
        }, new nitrogen.Principal() );
    };
    
    nitrogen.User = function ( user ) {
        this.user = user;        
    },
    
    // Export globally because thats what the nitrogen library will do
    window.nitrogen = nitrogen;
})();

