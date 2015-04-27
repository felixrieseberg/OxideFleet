(function() {

    
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

    // only enable this mock for testing
    if (env.APP.rootElement !== "#ember-testing") {
        return;
    }

    var Microsoft = {
        Maps: {

            Color: {

                fromHex: function (hex) {
                    Microsoft.assert.ok(typeof hex === 'string' && hex.indexOf('#') > -1);
                }
            },

            Pushpin: function (location, iconOptions) {
                Microsoft.assert.ok(typeof location.latitude === 'number');
                Microsoft.assert.ok(typeof location.longitude === 'number');
                Microsoft.assert.ok(typeof iconOptions === 'object');
            },

            Polyline: function (locations, pathOptions) {
                locations.forEach( function(location) {
                    Microsoft.assert.ok(typeof location.latitude === 'number');
                    Microsoft.assert.ok(typeof location.longitude === 'number');
                });

                Microsoft.assert.ok(typeof pathOptions.strokeColor === 'object');
                Microsoft.assert.ok(typeof pathOptions.strokeThickness === 'number');
            }
        }
    }

    // export globally
    window.Microsoft = Microsoft;

})();