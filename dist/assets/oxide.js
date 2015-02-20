/* jshint ignore:start */

/* jshint ignore:end */

define('oxide/adapters/application', ['exports', 'oxide/app', 'ember-data', 'oxide/config/environment'], function (exports, App, DS, Config) {

    'use strict';

    var namespace = Config['default'].environment === "test" ? "cc_test" : "ccar";

    App['default'].ApplicationSerializer = DS['default'].LSSerializer.extend();
    exports['default'] = DS['default'].LSAdapter.extend({
        namespace: namespace
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

});
define('oxide/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'oxide/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('oxide/authenticators/nitrogen', ['exports', 'ember', 'simple-auth/authenticators/base', 'oxide/config/environment', 'oxide/utils/nitrogen-ember-utils'], function (exports, Ember, Base, Config, nitrogenEmberUtils) {

    'use strict';

    var nitrogenService = null;

    exports['default'] = Base['default'].extend({
        init: function () {
            nitrogenService = new nitrogen.Service(Config['default'].APP.nitrogen);
        },

        /**
        Restores the session from a set of session properties.
        @method restore
        @param {Object} data The data to restore the session from
        @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
        */
        restore: function (data) {
            var self = this;
            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                var principal = new nitrogen.User({
                    accessToken: {
                        token: data.accessToken.token
                    },
                    id: data.user.id,
                    nickname: data.user.nickname
                });

                nitrogenService.resume(principal, function (err, session, principal) {
                    var store;

                    if (err) {
                        return reject(err);
                    }
                    store = self.container.lookup("store:main");

                    nitrogenEmberUtils['default'].findOrCreateUser(store, session, principal).then(function (storedUser) {
                        return nitrogenEmberUtils['default'].updateOrCreateDevices(store, session, storedUser);
                    }).then(function () {
                        var appController = self.container.lookup("controller:application");

                        console.log("Resolving Login", session);
                        appController.set("nitrogenSession", session);
                        appController.set("nitrogenService", nitrogenService);
                        resolve({ user: principal, accessToken: session.accessToken });
                    });
                });
            });
        },

        /**
        Authenticates the session with the specified `credentials`.
        @method authenticate
        @param {Object} credentials The credentials to authenticate the session with
        @return {Ember.RSVP.Promise} A promise that resolves when an access token is successfully acquired from the server and rejects otherwise
        */
        authenticate: function (credentials) {
            var self = this;
            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                var user = new nitrogen.User({
                    nickname: "current",
                    email: credentials.identification,
                    password: credentials.password
                });

                Ember['default'].run(function () {
                    nitrogenService.authenticate(user, function (err, session, principal) {
                        var store;

                        if (err) {
                            return reject(JSON.parse(err));
                        }
                        store = self.container.lookup("store:main");

                        nitrogenEmberUtils['default'].findOrCreateUser(store, session, principal).then(function (storedUser) {
                            return nitrogenEmberUtils['default'].updateOrCreateDevices(store, session, storedUser);
                        }).then(function () {
                            var appController = self.container.lookup("controller:application");

                            console.log("Resolving Login", session);
                            appController.set("nitrogenSession", session);
                            appController.set("nitrogenService", nitrogenService);
                            resolve({ user: principal, accessToken: session.accessToken });
                        });
                    });
                });
            });
        },

        /**
        Cancels any outstanding automatic token refreshes and returns a resolving promise.
        @method invalidate
        @param {Object} data The data of the session to be invalidated
        @return {Ember.RSVP.Promise} A resolving promise
        */
        invalidate: function () {
            return new Ember['default'].RSVP.Promise(function (resolve) {
                console.log("Nitrogen authenticator invalidate.");
                nitrogenService = null;
                resolve({ user: null, accessToken: null });
            });
        }
    });

});
define('oxide/components/ember-notify', ['exports', 'ember-notify/components/ember-notify'], function (exports, Notify) {

	'use strict';

	exports['default'] = Notify['default'];

});
define('oxide/components/loading-balls', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-bars', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-bubbles', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-cubes', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-cylon', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-spin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-spinning-bubbles', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/loading-spokes', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    size: 250,
    color: "white",

    loadingSvgSize: (function () {
      return this.get("size");
    }).property("size"),

    loadingSvgColor: (function () {
      return this.get("color");
    }).property("color")
  });

});
define('oxide/components/ox-map', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /* global Microsoft */

    exports['default'] = Ember['default'].Component.extend({

        zoom: 6,
        showDashboard: false,

        setup: (function () {
            var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
                center: new Microsoft.Maps.Location(30, 0),
                credentials: "Akbhia6_9IoahE9Q2TyAVORP_IHbhkxmTiy25f8WXYpnt_pzIA0AhgvyDVHKJkhi",
                enableSearchLogo: false,
                zoom: this.get("zoom"),
                showDashboard: this.get("showDashboard")
            });

            this.set("mapReference", map);
        }).on("didInsertElement")

    });

});
define('oxide/components/ox-tagger', ['exports'], function (exports) {

    'use strict';

    var TaggingComponent = Ember.Component.extend({
        didInsertElement: function () {
            this.$("input").selectize({
                plugins: ["remove_button"],
                delimiter: ",",
                persist: false,

                create: function (input) {
                    return {
                        value: input,
                        text: input
                    };
                }
            });

            this.selectize = this.$("input")[0].selectize;
        },

        willDestroyElement: function () {
            this.selectize.destroy();
        }
    });

    exports['default'] = TaggingComponent;

});
define('oxide/controllers/application', ['exports', 'ember', 'oxide/config/environment'], function (exports, Ember, Config) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({

        version: Config['default'].APP.version,

        devices: (function () {
            return this.store.find("device");
        }).property(),

        currentUser: (function () {
            return this.store.find("user", "me");
        }).property()

    });

});
define('oxide/controllers/dashboard', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /* global Microsoft */
    exports['default'] = Ember['default'].ArrayController.extend({
        title: "Dashboard",
        needs: ["application", "nitrogen"],
        version: Ember['default'].computed.alias("controllers.application.version"),
        appController: Ember['default'].computed.alias("controllers.application"),
        nitrogenController: Ember['default'].computed.alias("controllers.nitrogen"),
        mapEntityTracker: [],
        trackedCars: [],

        carsConnected: Ember['default'].computed("model", function () {
            var model = this.get("model");

            if (model.content.length > 0) {
                return true;
            } else {
                return false;
            }
        }),

        // Observes `trackedCars` to sync map pushpins and tracked cars
        trackedCarsObserver: (function () {
            var mapEntityTracker = this.get("mapEntityTracker"),
                trackedCars = this.get("trackedCars"),
                nitrogenController = this.get("nitrogenController"),
                map = this.get("mapReference"),
                self = this;

            function handleFoundDevices(foundDevices) {
                var foundDevice = undefined;

                if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                    foundDevice = foundDevices.content[0];
                    nitrogenController.send("getLastMessage", foundDevice.get("nitrogen_id"), 1, self, "handleLastLocation");
                }
            }

            for (var i = 0; i < mapEntityTracker.length; i += 1) {
                if (trackedCars.indexOf(mapEntityTracker[i].name) === -1) {
                    // Car is on map, but not in trackedCars - remove from map
                    map.entities.removeAt(mapEntityTracker[i].path);
                    map.entities.removeAt(mapEntityTracker[i].pin);
                    mapEntityTracker.splice(i, 1);
                }
            }

            for (var i = 0; i < trackedCars.length; i += 1) {
                if (!mapEntityTracker.findBy("name", trackedCars[i])) {
                    // Car is not on map, but in trackedCars - add to map
                    this.store.find("device", { nitrogen_id: trackedCars[i] }).then(handleFoundDevices);
                }
            }
        }).observes("trackedCars.[]").on("init"),

        init: function () {
            var nitrogenController = this.get("nitrogenController");

            this._super();
            console.log(this);
            nitrogenController.send("subscribeToNitrogen", this, "handleSocketMessage");
        },

        actions: {
            toggleCar: function (device) {
                var trackedCars = this.get("trackedCars");

                device.toggleProperty("trackOnMap");

                if (device.get("trackOnMap") === true) {
                    trackedCars.pushObject(device.get("nitrogen_id"));
                } else {
                    trackedCars.removeObject(device.get("nitrogen_id"));
                }
            },

            handleLocations: function (locations, principalId, callback) {
                var self = this;

                if (locations.length > 0) {
                    this.store.find("device", { nitrogen_id: principalId }).then(function (foundDevices) {
                        var foundDevice, i, gps;

                        if (foundDevices && foundDevices.content && foundDevices.content.length > 0) {
                            foundDevice = foundDevices.content[0];
                            gps = foundDevice.get("gps");

                            for (i = 0; i < locations.length; i += 1) {
                                if (!locations[i].body.timestamp) {
                                    locations[i].body.timestamp = Date.now();
                                }

                                gps.pushObject(locations[i].body);
                                foundDevice.save();
                            }

                            if (foundDevice.get("trackOnMap")) {
                                self.send(callback, foundDevice);
                            }
                        }
                    });
                }
            },

            handleSocketMessage: function (message) {
                var locations = [];

                if (message && message.from) {
                    locations.push(message);
                    this.send("handleLocations", locations, message.from, "updateCar");
                }
            },

            handleLastLocation: function (locations, principalId) {
                if (locations && principalId) {
                    this.send("handleLocations", locations, principalId, "addCarToMap");
                }
            },

            updateCar: function (device) {
                var map = this.get("mapReference"),
                    name = device.get("nitrogen_id"),
                    mapEntityTracker = this.get("mapEntityTracker"),
                    locations = device.get("gps"),
                    lat = locations[locations.length - 1].latitude,
                    lon = locations[locations.length - 1].longitude,
                    lastLocation = { longitude: lon, latitude: lat },
                    pathLocations,
                    path,
                    pin,
                    i;

                this.set("speed", Math.round(locations[locations.length - 1].speed));
                this.set("lastLocation", lastLocation);
                this.set("lat", lat.toFixed(4));
                this.set("lon", lon.toFixed(4));

                for (i = 0; i < mapEntityTracker.length; i += 1) {
                    if (mapEntityTracker[i].name === name) {
                        path = map.entities.removeAt(mapEntityTracker[i].path);
                        pin = map.entities.removeAt(mapEntityTracker[i].pin);

                        pin.setLocation(lastLocation);
                        map.entities.insert(pin, mapEntityTracker[i].pin);

                        pathLocations = path.getLocations();
                        pathLocations.push(lastLocation);
                        path.setLocations(pathLocations);
                        map.entities.insert(path, mapEntityTracker[i].path);
                    }
                }
            },

            centerMap: function (location) {
                var map = this.get("mapReference"),
                    mapOptions = map.getOptions();

                mapOptions.zoom = 15;
                mapOptions.center = { latitude: location.latitude, longitude: location.longitude };
                map.setView(mapOptions);
            },

            addCarToMap: function (device) {
                var locations = device.get("gps"),
                    lastLocation = locations[0],
                    iconUrl = "assets/img/carIcon.png",
                    iconOptions = { icon: iconUrl, height: 50, width: 50 },
                    map = this.get("mapReference"),
                    mapLocations = [],
                    pathOptions = { strokeColor: new Microsoft.Maps.Color.fromHex("#009587"), strokeThickness: 5 },
                    path,
                    pin,
                    entityLength;

                for (var i = 0; i < locations.length; i += 1) {
                    mapLocations.push({ latitude: locations[i].latitude, longitude: lastLocation.longitude });
                }

                pin = new Microsoft.Maps.Pushpin({ latitude: lastLocation.latitude, longitude: lastLocation.longitude }, iconOptions);
                path = new Microsoft.Maps.Polyline(mapLocations, pathOptions);

                // Save index of entities pushed (so we can update them later)
                entityLength = map.entities.getLength();
                this.get("mapEntityTracker").pushObject({
                    name: device.get("nitrogen_id"),
                    pin: entityLength,
                    path: entityLength + 1
                });
                this.get("trackedCars").pushObject(device.get("nitrogen_id"));

                // Push objects to map
                map.entities.push(pin);
                map.entities.push(path);

                this.send("centerMap", { latitude: lastLocation.latitude, longitude: lastLocation.longitude });
            }
        }
    });

});
define('oxide/controllers/device', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ObjectController.extend({

        title: (function () {
            return this.get("model").get("name");
        }).property(),

        celsius: (function () {
            return Math.round((this.get("fahrenheit") - 32) * (5 / 9) * 100) / 100;
        }).property("fahrenheit"),

        targetCelsius: (function () {
            return Math.round((this.get("targetFahrenheit") - 32) * (5 / 9) * 100) / 100;
        }).property("targetFahrenheit"),

        lastUpdatedReadable: (function () {
            var format = "MMMM Do, h:mm:ss a",
                updated = this.get("lastUpdated");

            return moment(updated).format(format);
        }).property("lastUpdated"),

        presets: (function () {
            return this.store.find("preset");
        }).property(),

        tagString: (function (key, value) {
            var deviceTags = this.get("tags");

            // Setter
            if (arguments.length > 1) {
                this.set("tags", value.split(","));
            }

            // Getter
            if (deviceTags) {
                return this.get("tags").toString();
            } else {
                return "";
            }
        }).property("tags"),

        actions: {
            selectNewPreset: function (preset) {
                if (!preset) {
                    return this.set("preset", null);
                }

                var newPreset = this.store.getById("preset", preset.id);
                this.set("preset", newPreset);
            },

            save: function (device) {
                device.save();
            }
        }

    });

});
define('oxide/controllers/login', ['exports', 'ember', 'simple-auth/mixins/login-controller-mixin'], function (exports, Ember, LoginControllerMixin) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend(LoginControllerMixin['default'], {
        title: "Sign In",
        authenticator: "authenticator:nitrogen",
        loading: false,

        init: function () {
            this._super();
            this.set("loading", false);
        },

        actions: {
            authenticateWithGoogle: function () {
                var self = this;

                this.get("session").authenticate("simple-auth-authenticator:torii", "google-oauth2").then(function () {
                    self.transitionToRoute("dashboard");
                }, function (error) {
                    console.log(error);
                });
            },

            authenticateWithFacebook: function () {
                var self = this;

                this.get("session").authenticate("simple-auth-authenticator:torii", "facebook-oauth2").then(function () {
                    self.transitionToRoute("dashboard");
                }, function (error) {
                    console.log(error);
                });
            },

            // display an error when authentication fails
            authenticate: function () {
                var self = this;
                this.set("loading", true);

                this._super().then(function () {
                    Ember['default'].Logger.debug("Session authentication succeeded");
                }, function (error) {
                    this.set("loading", false);
                    Ember['default'].Logger.debug("Session authentication failed with message:", error.message);
                    self.notify.warning({ message: "Incorrect email or password.", closeAfter: 7000 });
                });
            }
        }
    });

});
define('oxide/controllers/nitrogen', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: "application",
        appController: Ember['default'].computed.alias("controllers.application"),
        subscribeToNitrogen: false,

        actions: {
            createNewDevice: function (options) {
                var appController = this.get("appController"),
                    nitrogenService = appController.get("nitrogenService"),
                    currentUsers = appController.get("currentUser"),
                    apikey = currentUsers.content.get("api_key"),
                    newDevice;

                if (apikey) {
                    options = _.defaults(options, {
                        nickname: "OxideDevice",
                        name: "Oxide Device",
                        tags: ["oxide"],
                        api_key: apikey
                    });

                    newDevice = new nitrogen.Device(options);
                    nitrogenService.connect(newDevice, function (err, session, principal) {
                        console.log(session, principal);
                    });
                }
            },

            subscribeToNitrogen: function (originalController, callback) {
                var appController = this.get("appController"),
                    nitrogenSession = appController.get("nitrogenSession");

                if (this.get("subscribedToNitrogen") || !nitrogenSession) {
                    return;
                }

                nitrogenSession.onMessage({
                    $or: [{ type: "location" }]
                }, function (message) {
                    originalController.send(callback, message);
                });

                this.set("subscribedToNitrogen", true);
            },

            getLastMessage: function (principalId, messageLimit, originalController, callback) {
                var appController = this.get("appController"),
                    nitrogenSession = appController.get("nitrogenSession"),
                    limit = messageLimit ? messageLimit : 0;

                if (nitrogenSession && principalId) {
                    nitrogen.Message.find(nitrogenSession, { type: "location", from: principalId }, { sort: { ts: -1 }, limit: limit }, function (err, locations) {
                        if (err) {
                            return;
                        }
                        originalController.send(callback, locations, principalId);
                    });
                }
            }
        }

    });

});
define('oxide/controllers/settings', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({

        title: "Settings"

    });

});
define('oxide/helpers/fa-icon', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var FA_PREFIX = /^fa\-.+/;

  var warn = Ember['default'].Logger.warn;

  /**
   * Handlebars helper for generating HTML that renders a FontAwesome icon.
   *
   * @param  {String} name    The icon name. Note that the `fa-` prefix is optional.
   *                          For example, you can pass in either `fa-camera` or just `camera`.
   * @param  {Object} options Options passed to helper.
   * @return {Ember.Handlebars.SafeString} The HTML markup.
   */
  var faIcon = function (name, options) {
    if (Ember['default'].typeOf(name) !== "string") {
      var message = "fa-icon: no icon specified";
      warn(message);
      return new Ember['default'].Handlebars.SafeString(message);
    }

    var params = options.hash,
        classNames = [],
        html = "";

    classNames.push("fa");
    if (!name.match(FA_PREFIX)) {
      name = "fa-" + name;
    }
    classNames.push(name);
    if (params.spin) {
      classNames.push("fa-spin");
    }
    if (params.flip) {
      classNames.push("fa-flip-" + params.flip);
    }
    if (params.rotate) {
      classNames.push("fa-rotate-" + params.rotate);
    }
    if (params.lg) {
      warn("fa-icon: the 'lg' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"lg\"}}");
      classNames.push("fa-lg");
    }
    if (params.x) {
      warn("fa-icon: the 'x' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"" + params.x + "\"}}");
      classNames.push("fa-" + params.x + "x");
    }
    if (params.size) {
      if (Ember['default'].typeOf(params.size) === "number") {
        classNames.push("fa-" + params.size + "x");
      } else {
        classNames.push("fa-" + params.size);
      }
    }
    if (params.fixedWidth) {
      classNames.push("fa-fw");
    }
    if (params.listItem) {
      classNames.push("fa-li");
    }
    if (params.pull) {
      classNames.push("pull-" + params.pull);
    }
    if (params.border) {
      classNames.push("fa-border");
    }
    if (params.classNames && !Ember['default'].isArray(params.classNames)) {
      params.classNames = [params.classNames];
    }
    if (!Ember['default'].isEmpty(params.classNames)) {
      Array.prototype.push.apply(classNames, params.classNames);
    }

    html += "<i";
    html += " class='" + classNames.join(" ") + "'";
    if (params.title) {
      html += " title='" + params.title + "'";
    }
    html += "></i>";
    return new Ember['default'].Handlebars.SafeString(html);
  };

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(faIcon);

  exports.faIcon = faIcon;

});
define('oxide/helpers/pretty-date', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.prettyDate = prettyDate;

    function prettyDate(timestamp) {
        return moment(timestamp).calendar();
    }exports['default'] = Ember['default'].Handlebars.makeBoundHelper(prettyDate);

});
define('oxide/helpers/round-number', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.round = round;

    function round(input, points) {
        if (points === undefined) {
            points = 2;
        }
        return parseFloat(input).toFixed(points);
    }exports['default'] = Ember['default'].Handlebars.makeBoundHelper(round);

});
define('oxide/initializers/app-version', ['exports', 'oxide/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function (container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('oxide/initializers/ember-notify', ['exports', 'ember-notify'], function (exports, Notify) {

  'use strict';

  exports['default'] = {
    name: "ember-notify",
    initialize: function (container, app) {
      container.optionsForType("notify", { instantiate: false, singleton: true });
      app.register("notify:main", Notify['default']);
      app.inject("route", "notify", "notify:main");
      app.inject("controller", "notify", "notify:main");
    }
  };

});
define('oxide/initializers/export-application-global', ['exports', 'ember', 'oxide/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  };

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('oxide/initializers/nitrogen', ['exports', 'oxide/authenticators/nitrogen'], function (exports, nitrogenAuth) {

	'use strict';

	exports['default'] = {
		name: "authentication",
		initialize: function (container) {
			console.log("Loading nitrogen initializer.");
			container.register("authenticator:nitrogen", nitrogenAuth['default']);
		}
	};

});
define('oxide/initializers/simple-auth-testing', ['exports', 'simple-auth-testing/initializer'], function (exports, initializer) {

	'use strict';

	exports['default'] = initializer['default'];

});
define('oxide/initializers/simple-auth', ['exports', 'simple-auth/configuration', 'simple-auth/setup', 'oxide/config/environment'], function (exports, Configuration, setup, ENV) {

  'use strict';

  exports['default'] = {
    name: "simple-auth",
    initialize: function (container, application) {
      Configuration['default'].load(container, ENV['default']["simple-auth"] || {});
      setup['default'](container, application);
    }
  };

});
define('oxide/models/device', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var Device = DS['default'].Model.extend({
        nitrogen_id: DS['default'].attr("string"),
        name: DS['default'].attr("string"),
        status: DS['default'].attr("boolean", { defaultValue: false }),
        lastUpdated: DS['default'].attr("number"),
        last_connection: DS['default'].attr("string"),
        last_ip: DS['default'].attr("string"),
        nickname: DS['default'].attr("string"),
        created_at: DS['default'].attr("string"),
        updated_at: DS['default'].attr("string"),
        tags: DS['default'].attr(),
        type: DS['default'].attr(),
        location: DS['default'].attr(),

        // Connected Car
        gps: DS['default'].attr("array"),
        trackOnMap: DS['default'].attr("boolean"),

        // Relations
        owner: DS['default'].belongsTo("user", { async: true })
    });

    exports['default'] = Device;

});
define('oxide/models/user', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    var User = DS['default'].Model.extend({

        // Oxide
        avatarUrl: (function () {
            return "http://www.gravatar.com/avatar/" + md5(this.get("email")) + "?s=200&r=pg";
        }).property("email"),

        // Nitrogen
        name: DS['default'].attr("string"),
        email: DS['default'].attr("string"),
        api_key: DS['default'].attr("string"),
        created_at: DS['default'].attr("string"),
        nitrogen_id: DS['default'].attr("string"),
        last_connection: DS['default'].attr("string"),
        last_ip: DS['default'].attr("string"),
        nickname: DS['default'].attr("string"),
        password: DS['default'].attr("string"),
        updated_at: DS['default'].attr("string"),

        // Relations
        devices: DS['default'].hasMany("device", { async: true })
    });

    exports['default'] = User;

});
define('oxide/router', ['exports', 'ember', 'oxide/config/environment'], function (exports, Ember, config) {

    'use strict';

    var Router = Ember['default'].Router.extend({
        location: config['default'].locationType
    });

    Router.map(function () {
        this.resource("dashboard", { path: "/" });

        this.resource("device", { path: "device/:device_id" });
        this.resource("user", { path: "users/:user_id" });

        this.route("login");
        this.route("dashboard");
        this.route("settings");
    });

    exports['default'] = Router;

});
define('oxide/routes/application', ['exports', 'ember', 'simple-auth/mixins/application-route-mixin'], function (exports, Ember, ApplicationRouteMixin) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend(ApplicationRouteMixin['default'], {

        actions: {
            sessionInvalidationSucceeded: function () {
                // Force reload to empty all cached data
                window.location = "http://" + document.location.host;
            }
        }
    });

});
define('oxide/routes/dashboard', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
        model: function () {
            return this.store.find("device");
        }
    });

});
define('oxide/routes/device', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function (params) {
            return this.store.find("device", params.device_id);
        }
    });

});
define('oxide/routes/login', ['exports', 'ember', 'simple-auth/mixins/unauthenticated-route-mixin'], function (exports, Ember, UnauthenticatedRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(UnauthenticatedRouteMixin['default'], {});

});
define('oxide/routes/settings', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('oxide/routes/user', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('oxide/templates/-devicecard', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","device-head");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h5");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","device box");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","main-list");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("Nitrogen ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("Status");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [1, 3]),-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [3, 3]),-1,-1);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [5, 3]),-1,-1);
        content(env, morph0, context, "name");
        content(env, morph1, context, "name");
        content(env, morph2, context, "nitrogen_id");
        content(env, morph3, context, "status");
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-devicelist', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("ul");
        dom.setAttribute(el0,"class","main-list");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Name");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Nitrogen ID");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Status");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Last Updated");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Last Connection");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Last IP");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Nickname");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Created");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Updated");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Owner");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("small");
        var el3 = dom.createTextNode("Tags");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 3]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [3, 3]),-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [5, 3]),-1,-1);
        var morph3 = dom.createMorphAt(dom.childAt(fragment, [7, 3]),-1,-1);
        var morph4 = dom.createMorphAt(dom.childAt(fragment, [9, 3]),-1,-1);
        var morph5 = dom.createMorphAt(dom.childAt(fragment, [11, 3]),-1,-1);
        var morph6 = dom.createMorphAt(dom.childAt(fragment, [13, 3]),-1,-1);
        var morph7 = dom.createMorphAt(dom.childAt(fragment, [15, 3]),-1,-1);
        var morph8 = dom.createMorphAt(dom.childAt(fragment, [17, 3]),-1,-1);
        var morph9 = dom.createMorphAt(dom.childAt(fragment, [19, 3]),-1,-1);
        var morph10 = dom.createMorphAt(dom.childAt(fragment, [21]),2,3);
        content(env, morph0, context, "name");
        content(env, morph1, context, "nitrogen_id");
        content(env, morph2, context, "status");
        content(env, morph3, context, "lastUpdated");
        content(env, morph4, context, "last_connection");
        content(env, morph5, context, "last_ip");
        content(env, morph6, context, "nickname");
        content(env, morph7, context, "created_at");
        content(env, morph8, context, "updated_at");
        content(env, morph9, context, "owner.name");
        inline(env, morph10, context, "ox-tagger", [], {"value": get(env, context, "tagString")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-navbar', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          var el2 = dom.createTextNode("Dashboard");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          element(env, element1, context, "bind-attr", [], {"href": "view.href"});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          var el2 = dom.createTextNode("Settings");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          element(env, element0, context, "bind-attr", [], {"href": "view.href"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("nav");
        dom.setAttribute(el0,"class","navbar navbar-inverse navbar-static-top");
        dom.setAttribute(el0,"role","navigation");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","navbar-header");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","button");
        dom.setAttribute(el2,"class","navbar-toggle");
        dom.setAttribute(el2,"data-toggle","collapse");
        dom.setAttribute(el2,"data-target","#navbar-collapse-01");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","sr-only");
        var el4 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","collapse navbar-collapse");
        dom.setAttribute(el1,"id","navbar-collapse-01");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","nav navbar-nav");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","nav navbar-nav navbar-right");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"style","padding-right: 10px");
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        var el5 = dom.createTextNode("Sign Out");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [3]);
        var element3 = dom.childAt(element2, [1]);
        if (this.cachedFragment) { dom.repairClonedNode(element3,[1]); }
        var element4 = dom.childAt(element2, [3, 1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),2,3);
        var morph1 = dom.createMorphAt(element3,0,1);
        var morph2 = dom.createMorphAt(element3,1,2);
        inline(env, morph0, context, "link-to", ["Connected Car", "dashboard"], {"class": "navbar-brand"});
        block(env, morph1, context, "link-to", ["dashboard"], {"tagName": "li", "href": false}, child0, null);
        block(env, morph2, context, "link-to", ["settings"], {"tagName": "li", "href": false}, child1, null);
        element(env, element4, context, "action", ["invalidateSession"], {});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-sidebar', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                            Seen: ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              inline(env, morph0, context, "pretty-Date", [get(env, context, "car.gps.firstObject.timestamp")], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("                            Never seen\n");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child2 = (function() {
          var child0 = (function() {
            var child0 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                            ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("a");
                  dom.setAttribute(el1,"type","button");
                  dom.setAttribute(el1,"class","btn btn-embossed btn-primary btn-xs");
                  var el2 = dom.createElement("i");
                  dom.setAttribute(el2,"class","fa fa-location");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode(" Go to");
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, element = hooks.element;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var element1 = dom.childAt(fragment, [1]);
                  element(env, element1, context, "action", ["centerMap", get(env, context, "car.gps.firstObject")], {});
                  return fragment;
                }
              };
            }());
            var child1 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("                                ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("span");
                  var el2 = dom.createTextNode(" ");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createElement("i");
                  dom.setAttribute(el2,"class","fa fa-tachometer");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode(" ");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode(" mph ");
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n                                ");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),2,3);
                  inline(env, morph0, context, "round-number", [get(env, context, "car.gps.firstObject.speed"), 0], {});
                  return fragment;
                }
              };
            }());
            var child2 = (function() {
              return {
                isHTMLBars: true,
                blockParams: 0,
                cachedFragment: null,
                hasRendered: false,
                build: function build(dom) {
                  var el0 = dom.createDocumentFragment();
                  var el1 = dom.createTextNode("\n                                ");
                  dom.appendChild(el0, el1);
                  var el1 = dom.createElement("span");
                  var el2 = dom.createElement("i");
                  dom.setAttribute(el2,"class","fa fa-compass");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode(" ");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode(" ");
                  dom.appendChild(el1, el2);
                  dom.appendChild(el0, el1);
                  var el1 = dom.createTextNode("\n");
                  dom.appendChild(el0, el1);
                  return el0;
                },
                render: function render(context, env, contextualElement) {
                  var dom = env.dom;
                  var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
                  dom.detectNamespace(contextualElement);
                  var fragment;
                  if (env.useFragmentCache && dom.canClone) {
                    if (this.cachedFragment === null) {
                      fragment = this.build(dom);
                      if (this.hasRendered) {
                        this.cachedFragment = fragment;
                      } else {
                        this.hasRendered = true;
                      }
                    }
                    if (this.cachedFragment) {
                      fragment = dom.cloneNode(this.cachedFragment, true);
                    }
                  } else {
                    fragment = this.build(dom);
                  }
                  var element0 = dom.childAt(fragment, [1]);
                  var morph0 = dom.createMorphAt(element0,1,2);
                  var morph1 = dom.createMorphAt(element0,2,-1);
                  inline(env, morph0, context, "round-number", [get(env, context, "car.gps.firstObject.latitude"), 3], {});
                  inline(env, morph1, context, "round-number", [get(env, context, "car.gps.firstObject.longitude"), 3], {});
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("\n                    ");
                dom.appendChild(el0, el1);
                var el1 = dom.createElement("li");
                var el2 = dom.createTextNode("\n                        ");
                dom.appendChild(el1, el2);
                var el2 = dom.createElement("div");
                dom.setAttribute(el2,"class","car-metadata");
                var el3 = dom.createTextNode("\n");
                dom.appendChild(el2, el3);
                var el3 = dom.createTextNode("");
                dom.appendChild(el2, el3);
                var el3 = dom.createTextNode("");
                dom.appendChild(el2, el3);
                var el3 = dom.createTextNode("                        ");
                dom.appendChild(el2, el3);
                dom.appendChild(el1, el2);
                var el2 = dom.createTextNode("\n                    ");
                dom.appendChild(el1, el2);
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n                ");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, block = hooks.block;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var element2 = dom.childAt(fragment, [1, 1]);
                if (this.cachedFragment) { dom.repairClonedNode(element2,[1,2]); }
                var morph0 = dom.createMorphAt(element2,0,1);
                var morph1 = dom.createMorphAt(element2,1,2);
                var morph2 = dom.createMorphAt(element2,2,3);
                block(env, morph0, context, "if", [get(env, context, "car.gps.firstObject.latitude")], {}, child0, null);
                block(env, morph1, context, "if", [get(env, context, "car.gps.firstObject.speed")], {}, child1, null);
                block(env, morph2, context, "if", [get(env, context, "car.gps.firstObject.latitude")], {}, child2, null);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              block(env, morph0, context, "if", [get(env, context, "car.gps.firstObject")], {}, child0, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","flatpanel-icon fa fa-car");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","flatpanel-content");
            var el3 = dom.createTextNode("\n                        ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("h4");
            dom.setAttribute(el3,"class","flatpanel-name");
            var el4 = dom.createTextNode("\n                            ");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n                        ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("                    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element3 = dom.childAt(fragment, [1]);
            var element4 = dom.childAt(element3, [3]);
            var morph0 = dom.createMorphAt(dom.childAt(element4, [1]),0,1);
            var morph1 = dom.createMorphAt(element4,2,3);
            var morph2 = dom.createMorphAt(fragment,2,3,contextualElement);
            element(env, element3, context, "action", ["toggleCar", get(env, context, "car")], {});
            element(env, element3, context, "bind-attr", [], {"class": "car.trackOnMap:flatpanel-selected:flatpanel-notselected"});
            content(env, morph0, context, "car.name");
            block(env, morph1, context, "if", [get(env, context, "car.gps.firstObject.timestamp")], {}, child0, child1);
            block(env, morph2, context, "if", [get(env, context, "car.trackOnMap")], {}, child2, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "car"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","panel-menu");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","flatpanel");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","flatpanel-title");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Track Cars");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        var el2 = dom.createTextNode("Internal Preview ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),2,3);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,-1);
        block(env, morph0, context, "if", [get(env, context, "carsConnected")], {}, child0, null);
        content(env, morph1, context, "version");
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,2]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "outlet");
        inline(env, morph1, context, "ember-notify", [], {"messageStyle": "bootstrap"});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/ember-notify', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"class","close");
            var el2 = dom.createTextNode("×");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","message");
            var el2 = dom.createTextNode("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(fragment, [3]);
            if (this.cachedFragment) { dom.repairClonedNode(element1,[0]); }
            var morph0 = dom.createMorphAt(element1,-1,0);
            var morph1 = dom.createUnsafeMorphAt(element1,0,-1);
            element(env, element0, context, "action", ["close"], {"target": "view"});
            content(env, morph0, context, "message.message");
            content(env, morph1, context, "message.raw");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "view", [get(env, context, "view.messageClass")], {"message": get(env, context, "message"), "closeAfter": get(env, context, "closeAfter"), "class": "clearfix"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "messages")], {"keyword": "message"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-balls', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"class","icon-loading");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(-8 0)");
        dom.setAttribute(el2,"d","M4 12 A4 4 0 0 0 4 20 A4 4 0 0 0 4 12");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","-8 0; 2 0; 2 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.25;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(2 0)");
        dom.setAttribute(el2,"d","M4 12 A4 4 0 0 0 4 20 A4 4 0 0 0 4 12");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","2 0; 12 0; 12 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.35;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(12 0)");
        dom.setAttribute(el2,"d","M4 12 A4 4 0 0 0 4 20 A4 4 0 0 0 4 12");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","12 0; 22 0; 22 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.45;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(24 0)");
        dom.setAttribute(el2,"d","M4 12 A4 4 0 0 0 4 20 A4 4 0 0 0 4 12");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","22 0; 32 0; 32 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.55;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-bars', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(2)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","d");
        dom.setAttribute(el3,"values","M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.2;.5;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(8)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","d");
        dom.setAttribute(el3,"values","M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.2");
        dom.setAttribute(el3,"keytimes","0;.2;.5;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(14)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","d");
        dom.setAttribute(el3,"values","M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.4");
        dom.setAttribute(el3,"keytimes","0;.2;.5;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(20)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","d");
        dom.setAttribute(el3,"values","M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.6");
        dom.setAttribute(el3,"keytimes","0;.2;.5;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(26)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","d");
        dom.setAttribute(el3,"values","M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.8");
        dom.setAttribute(el3,"keytimes","0;.2;.5;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-bubbles', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","translate(8 0)");
        dom.setAttribute(el2,"cx","0");
        dom.setAttribute(el2,"cy","16");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0; 4; 0; 0");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;0.2;0.7;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","translate(16 0)");
        dom.setAttribute(el2,"cx","0");
        dom.setAttribute(el2,"cy","16");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0; 4; 0; 0");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.3");
        dom.setAttribute(el3,"keytimes","0;0.2;0.7;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","translate(24 0)");
        dom.setAttribute(el2,"cx","0");
        dom.setAttribute(el2,"cy","16");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0; 4; 0; 0");
        dom.setAttribute(el3,"dur","1.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.6");
        dom.setAttribute(el3,"keytimes","0;0.2;0.7;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-cubes', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(-8 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H8 V12z");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","-8 0; 2 0; 2 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.25;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(2 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H8 V12z");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","2 0; 12 0; 12 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.35;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(12 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H8 V12z");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","12 0; 22 0; 22 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.45;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(24 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H8 V12z");
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","22 0; 32 0; 32 0;");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keytimes","0;.55;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-cylon', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"transform","translate(0 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","0 0; 28 0; 0 0; 0 0");
        dom.setAttribute(el3,"dur","1.5s");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"keytimes","0;0.3;0.6;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity","0.5");
        dom.setAttribute(el2,"transform","translate(0 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","0 0; 28 0; 0 0; 0 0");
        dom.setAttribute(el3,"dur","1.5s");
        dom.setAttribute(el3,"begin","0.1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"keytimes","0;0.3;0.6;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity","0.25");
        dom.setAttribute(el2,"transform","translate(0 0)");
        dom.setAttribute(el2,"d","M0 12 V20 H4 V12z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","translate");
        dom.setAttribute(el3,"values","0 0; 28 0; 0 0; 0 0");
        dom.setAttribute(el3,"dur","1.5s");
        dom.setAttribute(el3,"begin","0.2s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"keytimes","0;0.3;0.6;1");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-spin', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".25");
        dom.setAttribute(el2,"d","M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"d","M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animateTransform");
        dom.setAttribute(el3,"attributeName","transform");
        dom.setAttribute(el3,"type","rotate");
        dom.setAttribute(el3,"from","0 16 16");
        dom.setAttribute(el3,"to","360 16 16");
        dom.setAttribute(el3,"dur","0.8s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-spinning-bubbles', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(45 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.125s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(90 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.25s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(135 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.375s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(180 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.5s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(225 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.625s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(270 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.75s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(315 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.875s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("circle");
        dom.setAttribute(el2,"transform","rotate(180 16 16)");
        dom.setAttribute(el2,"cx","16");
        dom.setAttribute(el2,"cy","3");
        dom.setAttribute(el2,"r","0");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","r");
        dom.setAttribute(el3,"values","0;3;0;0");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.5s");
        dom.setAttribute(el3,"keySplines","0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8");
        dom.setAttribute(el3,"calcMode","spline");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/loading-spokes', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el1 = dom.createElement("svg");
        dom.setAttribute(el1,"id","loading");
        dom.setAttribute(el1,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el1,"viewBox","0 0 32 32");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(0 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(45 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.125s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(90 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.25s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(135 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.375s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(180 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.5s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(225 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.675s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(270 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.75s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("path");
        dom.setAttribute(el2,"opacity",".1");
        dom.setAttribute(el2,"d","M14 0 H18 V8 H14 z");
        dom.setAttribute(el2,"transform","rotate(315 16 16)");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("animate");
        dom.setAttribute(el3,"attributeName","opacity");
        dom.setAttribute(el3,"from","1");
        dom.setAttribute(el3,"to",".1");
        dom.setAttribute(el3,"dur","1s");
        dom.setAttribute(el3,"repeatCount","indefinite");
        dom.setAttribute(el3,"begin","0.875s");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"width": get(env, context, "loadingSvgSize"), "height": get(env, context, "loadingSvgSize"), "fill": get(env, context, "loadingSvgColor")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/ox-map', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","mapDiv");
        dom.setAttribute(el0,"style","position:relative; width:100%; height:calc(100vh - 53px);");
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/ox-tagger', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "value")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/dashboard', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","sidebar-container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","main-container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [4]),0,1);
        inline(env, morph0, context, "partial", ["navbar"], {});
        inline(env, morph1, context, "partial", ["sidebar"], {});
        inline(env, morph2, context, "ox-map", [], {"mapReference": get(env, context, "mapReference")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/device', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","devices-row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-12 device");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","device-head");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h5");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Overview");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","btn btn-inverse btn-sm pull-right");
        dom.setAttribute(el5,"type","button");
        var el6 = dom.createTextNode("Save");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","device box");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [1, 1, 3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        element(env, element1, context, "action", ["save", get(env, context, "this")], {});
        inline(env, morph0, context, "partial", ["devicelist"], {});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","darkbackground");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row login_box");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-md-12 col-xs-12");
        dom.setAttribute(el3,"align","center");
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","line");
        var el5 = dom.createElement("h5");
        dom.setAttribute(el5,"class","white");
        var el6 = dom.createTextNode("Connected Car");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","outter");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5,"src","assets/img/tile2.png");
        dom.setAttribute(el5,"class","image-circle");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("   \n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h3");
        dom.setAttribute(el4,"class","white");
        var el5 = dom.createTextNode("Welcome");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","white");
        var el5 = dom.createTextNode("Please Sign In");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            \n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-md-12 col-xs-12 login_control");
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","control");
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    \n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","control");
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"align","center");
        var el6 = dom.createTextNode("\n                         ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6,"class","btn btn-primary btn-lg");
        var el7 = dom.createTextNode("Login");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1, 1, 3]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [5, 1]);
        var element3 = dom.childAt(element0, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
        var morph2 = dom.createMorphAt(element3,0,1);
        element(env, element1, context, "action", ["authenticate"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"class": "form-control floating-label login-field", "id": "identification", "placeholder": "Enter Login", "value": get(env, context, "identification")});
        inline(env, morph1, context, "input", [], {"class": "form-control floating-label login-field", "id": "password", "placeholder": "Enter Password", "type": "password", "value": get(env, context, "password")});
        element(env, element2, context, "bind-attr", [], {"disabled": get(env, context, "loading")});
        element(env, element3, context, "bind-attr", [], {"class": "loading:show:hidden :login-loading"});
        inline(env, morph2, context, "loading-spin", [], {"color": "red", "size": 50});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/settings', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/user', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('oxide/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('oxide/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('oxide/tests/authenticators/nitrogen.jshint', function () {

  'use strict';

  module('JSHint - authenticators');
  test('authenticators/nitrogen.js should pass jshint', function() { 
    ok(true, 'authenticators/nitrogen.js should pass jshint.'); 
  });

});
define('oxide/tests/components/ox-map.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/ox-map.js should pass jshint', function() { 
    ok(true, 'components/ox-map.js should pass jshint.'); 
  });

});
define('oxide/tests/components/ox-tagger.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/ox-tagger.js should pass jshint', function() { 
    ok(true, 'components/ox-tagger.js should pass jshint.'); 
  });

});
define('oxide/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('oxide/tests/controllers/dashboard.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/dashboard.js should pass jshint', function() { 
    ok(true, 'controllers/dashboard.js should pass jshint.'); 
  });

});
define('oxide/tests/controllers/device.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/device.js should pass jshint', function() { 
    ok(true, 'controllers/device.js should pass jshint.'); 
  });

});
define('oxide/tests/controllers/login.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/login.js should pass jshint', function() { 
    ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('oxide/tests/controllers/nitrogen.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/nitrogen.js should pass jshint', function() { 
    ok(true, 'controllers/nitrogen.js should pass jshint.'); 
  });

});
define('oxide/tests/controllers/settings.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/settings.js should pass jshint', function() { 
    ok(true, 'controllers/settings.js should pass jshint.'); 
  });

});
define('oxide/tests/helpers/login', ['ember'], function (Ember) {

    'use strict';

    Ember['default'].Test.registerAsyncHelper("login", function (app) {
        var applicationRoute = app.__container__.lookup("route:application");

        console.log("Login Called");

        Ember['default'].run(function () {
            applicationRoute.store.find("user", {
                id: "me"
            }).then(function () {
                authenticateSession();
            }, function () {
                var user = applicationRoute.store.createRecord("user", {
                    id: "me",
                    name: "John Doe",
                    email: "john@doe.com",
                    api_key: "5364e5c4213164980496dfd9",
                    created_at: "2014-11-13T18:42:34.881Z",
                    nitrogen_id: "6463fb9a45dds4ca04665422",
                    last_connection: "2015-02-12T23:57:33.426Z",
                    last_ip: "167.220.27.125",
                    nickname: "current",
                    password: "p@ssword",
                    updated_at: "2015-02-09T17:55:11.975Z"
                });

                user = user.save();

                var device = applicationRoute.store.createRecord("device", {
                    nitrogen_id: "5473b717e6b804c5040dda3b",
                    name: "Test Device",
                    status: false,
                    lastUpdated: null,
                    last_connection: "2015-02-12T23:57:33.426Z",
                    last_ip: "167.220.27.125",
                    nickname: "default",
                    created_at: "2015-01-09T17:55:11.975Z",
                    updated_at: "2015-02-09T17:55:11.975Z",
                    type: "device",
                    owner: user
                });

                device.save();

                authenticateSession();
            });
        });
    });

});
define('oxide/tests/helpers/login.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/login.js should pass jshint', function() { 
    ok(true, 'helpers/login.js should pass jshint.'); 
  });

});
define('oxide/tests/helpers/pretty-date.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/pretty-date.js should pass jshint', function() { 
    ok(true, 'helpers/pretty-date.js should pass jshint.'); 
  });

});
define('oxide/tests/helpers/resolver', ['exports', 'ember/resolver', 'oxide/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('oxide/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('oxide/tests/helpers/round-number.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/round-number.js should pass jshint', function() { 
    ok(true, 'helpers/round-number.js should pass jshint.'); 
  });

});
define('oxide/tests/helpers/start-app', ['exports', 'ember', 'oxide/app', 'oxide/router', 'oxide/config/environment', 'simple-auth-testing/test-helpers', 'oxide/tests/helpers/login'], function (exports, Ember, Application, Router, config, __dep4__, login) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('oxide/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('oxide/tests/initializers/nitrogen.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/nitrogen.js should pass jshint', function() { 
    ok(true, 'initializers/nitrogen.js should pass jshint.'); 
  });

});
define('oxide/tests/integration/authentication-test', ['ember', 'ember-qunit', 'oxide/tests/helpers/start-app'], function (Ember, ember_qunit, startApp) {

    'use strict';

    /* global Pretender, authenticateSession, invalidateSession, login */

    var App;

    module("Integration: Authentication", {
        setup: function () {
            App = startApp['default']();
        },
        teardown: function () {
            var applicationRoute = App.__container__.lookup("route:application");
            Ember['default'].run(function () {
                applicationRoute.store.unloadAll("device");
                applicationRoute.store.unloadAll("user");
            });
            Ember['default'].run(App, App.destroy);
        } });

    ember_qunit.test("users can log in", function () {
        var self = this;

        expect(2);
        visit("/");

        andThen(function () {
            equal(find("button:contains(\"Login\")").length, 1, "The page shows a login button when the session is not authenticated");
        });

        login();

        andThen(function () {
            equal(find("a:contains(\"Sign Out\")").length, 1, "The page shows a logout link when the session is authenticated");
        });
    });

    /*test('a protected route is accessible when the session is authenticated', function () {
        var self = this;

        expect(1);

        Ember.Run(function () {
            login();
        });

        visit('/dashboard');

        andThen(function () {
            equal(currentRouteName(), 'dashboard');
        });
    });

    test('a protected route is not accessible when the session is not authenticated', function () {
        expect(1);

        visit('/dashboard');

        andThen(function () {
            notEqual(currentRouteName(), 'dashboard');
        });
    });*/

});
define('oxide/tests/integration/authentication-test.jshint', function () {

  'use strict';

  module('JSHint - integration');
  test('integration/authentication-test.js should pass jshint', function() { 
    ok(true, 'integration/authentication-test.js should pass jshint.'); 
  });

});
define('oxide/tests/integration/dashboard-test', ['ember', 'ember-qunit', 'oxide/tests/helpers/start-app'], function (Ember, ember_qunit, startApp) {

    'use strict';

    /* global Pretender, authenticateSession, invalidateSession, login */

    var App;

    module("Integration: Dashboard", {
        setup: function () {
            App = startApp['default']();
        },
        teardown: function () {
            var applicationRoute = App.__container__.lookup("route:application");
            Ember['default'].run(function () {
                applicationRoute.store.unloadAll("device");
                applicationRoute.store.unloadAll("user");
            });
            Ember['default'].run(App, App.destroy);
        } });

    ember_qunit.test("Dashboard shows device card", function () {
        expect(1);
        visit("/");
        login();

        andThen(function () {
            equal(find("h4.flatpanel-name").length, 1, "A device is displayed");
        });
    });

});
define('oxide/tests/integration/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - integration');
  test('integration/dashboard-test.js should pass jshint', function() { 
    ok(true, 'integration/dashboard-test.js should pass jshint.'); 
  });

});
define('oxide/tests/integration/login-test', ['ember', 'ember-qunit', 'oxide/tests/helpers/start-app'], function (Ember, ember_qunit, startApp) {

    'use strict';

    /* global Pretender, authenticateSession, invalidateSession, login */

    var App;

    module("Integration: Login Flow", {
        setup: function () {
            App = startApp['default']();
        },
        teardown: function () {
            var applicationRoute = App.__container__.lookup("route:application");
            Ember['default'].run(function () {
                applicationRoute.store.unloadAll("device");
                applicationRoute.store.unloadAll("user");
            });
            Ember['default'].run(App, App.destroy);
        } });

    ember_qunit.test("users can log in", function () {
        expect(2);
        visit("/");

        andThen(function () {
            equal(find("button:contains(\"Login\")").length, 1, "The page shows a login button when the session is not authenticated");
        });

        login();

        andThen(function () {
            equal(find("a:contains(\"Sign Out\")").length, 1, "The page shows a logout link when the session is authenticated");
        });
    });

});
define('oxide/tests/integration/login-test.jshint', function () {

  'use strict';

  module('JSHint - integration');
  test('integration/login-test.js should pass jshint', function() { 
    ok(true, 'integration/login-test.js should pass jshint.'); 
  });

});
define('oxide/tests/models/device.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/device.js should pass jshint', function() { 
    ok(true, 'models/device.js should pass jshint.'); 
  });

});
define('oxide/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('oxide/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('oxide/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('oxide/tests/routes/dashboard.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/dashboard.js should pass jshint', function() { 
    ok(true, 'routes/dashboard.js should pass jshint.'); 
  });

});
define('oxide/tests/routes/device.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/device.js should pass jshint', function() { 
    ok(true, 'routes/device.js should pass jshint.'); 
  });

});
define('oxide/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('oxide/tests/routes/settings.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/settings.js should pass jshint', function() { 
    ok(true, 'routes/settings.js should pass jshint.'); 
  });

});
define('oxide/tests/routes/user.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/user.js should pass jshint', function() { 
    ok(true, 'routes/user.js should pass jshint.'); 
  });

});
define('oxide/tests/test-helper', ['oxide/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('oxide/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('oxide/tests/transforms/array.jshint', function () {

  'use strict';

  module('JSHint - transforms');
  test('transforms/array.js should pass jshint', function() { 
    ok(true, 'transforms/array.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:application", "ApplicationAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var adapter = this.subject();
    ok(adapter);
  });
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('oxide/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:application", "ApplicationController", {
    // Specify the other units that are required for this test.
    needs: ["controller:nitrogen"]
  });

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });

});
define('oxide/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controllers/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:dashboard", "DashboardController", {
    // Specify the other units that are required for this test.
    needs: ["controller:application", "controller:nitrogen"]
  });

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });

});
define('oxide/tests/unit/controllers/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/dashboard-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controllers/device-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:device", "DeviceController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/controllers/device-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/device-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/device-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controllers/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:login", "LoginController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/controllers/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/login-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/login-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controllers/nitrogen-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:nitrogen", "NitrogenController", {
    // Specify the other units that are required for this test.
    needs: ["controller:application"]
  });

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });

});
define('oxide/tests/unit/controllers/nitrogen-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/nitrogen-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/nitrogen-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controllers/settings-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:settings", "SettingsController", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/controllers/settings-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/settings-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/settings-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/helpers/pretty-date-test', ['oxide/helpers/pretty-date', 'qunit'], function (pretty_date, qunit) {

  'use strict';

  qunit.module("PrettyDateHelper");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = pretty_date.prettyDate(42);
    assert.ok(result);
  });

});
define('oxide/tests/unit/helpers/pretty-date-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/pretty-date-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/pretty-date-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/helpers/round-number-test', ['oxide/helpers/two-decimal', 'qunit'], function (two_decimal, qunit) {

  'use strict';

  qunit.module("TwoDecimalHelper");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = two_decimal.twoDecimal(42);
    assert.ok(result);
  });

});
define('oxide/tests/unit/helpers/round-number-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/round-number-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/round-number-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/device-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("device", "Device", {
    // Specify the other units that are required for this test.
    needs: ["model:user"]
  });

  ember_qunit.test("it exists", function () {
    var model = this.subject();
    // var store = this.store();
    ok(!!model);
  });

});
define('oxide/tests/unit/models/device-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/device-test.js should pass jshint', function() { 
    ok(true, 'unit/models/device-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/location-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("location", "Location", {
    // Specify the other units that are required for this test.
    needs: ["model:device", "model:user"]
  });

  ember_qunit.test("it exists", function () {
    var model = this.subject();
    // var store = this.store();
    ok(!!model);
  });

});
define('oxide/tests/unit/models/location-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/location-test.js should pass jshint', function() { 
    ok(true, 'unit/models/location-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("user", "User", {
    // Specify the other units that are required for this test.
    needs: ["model:device"]
  });

  ember_qunit.test("it exists", function () {
    var model = this.subject();
    // var store = this.store();
    ok(!!model);
  });

});
define('oxide/tests/unit/models/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/user-test.js should pass jshint', function() { 
    ok(true, 'unit/models/user-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:application", "ApplicationRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/application-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/application-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/routes/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:dashboard", "DashboardRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/routes/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/dashboard-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/routes/device-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:device", "DeviceRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/routes/device-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/device-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/device-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/routes/location-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:location", "LocationRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/routes/location-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/location-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/location-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/routes/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:login", "LoginRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/routes/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/login-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/login-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/routes/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:user", "UserRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('oxide/tests/unit/routes/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/user-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/user-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/views/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:application", "ApplicationView");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var view = this.subject();
    ok(view);
  });

});
define('oxide/tests/unit/views/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/application-test.js should pass jshint', function() { 
    ok(true, 'unit/views/application-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/views/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:dashboard", "DashboardView");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var view = this.subject();
    ok(view);
  });

});
define('oxide/tests/unit/views/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/views/dashboard-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/views/device-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:device", "DeviceView");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var view = this.subject();
    ok(view);
  });

});
define('oxide/tests/unit/views/device-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/device-test.js should pass jshint', function() { 
    ok(true, 'unit/views/device-test.js should pass jshint.'); 
  });

});
define('oxide/tests/utils/mobile.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/mobile.js should pass jshint', function() { 
    ok(true, 'utils/mobile.js should pass jshint.'); 
  });

});
define('oxide/tests/utils/nitrogen-ember-utils.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/nitrogen-ember-utils.js should pass jshint', function() { 
    ok(true, 'utils/nitrogen-ember-utils.js should pass jshint.'); 
  });

});
define('oxide/tests/views/application.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/application.js should pass jshint', function() { 
    ok(true, 'views/application.js should pass jshint.'); 
  });

});
define('oxide/tests/views/dashboard.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/dashboard.js should pass jshint', function() { 
    ok(true, 'views/dashboard.js should pass jshint.'); 
  });

});
define('oxide/tests/views/device.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/device.js should pass jshint', function() { 
    ok(true, 'views/device.js should pass jshint.'); 
  });

});
define('oxide/transforms/array', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

    'use strict';

    exports['default'] = DS['default'].Transform.extend({
        deserialize: function (value) {
            if (Ember['default'].isArray(value)) {
                return Ember['default'].A(value);
            } else {
                return Ember['default'].A();
            }
        },
        serialize: function (value) {
            if (Ember['default'].isArray(value)) {
                return Ember['default'].A(value);
            } else {
                return Ember['default'].A();
            }
        }
    });

});
define('oxide/utils/mobile', ['exports'], function (exports) {

	'use strict';

	var mobileQuery = matchMedia("(max-width: 900px)");

	exports['default'] = mobileQuery;

});
define('oxide/utils/nitrogen-ember-utils', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var nitrogenEmberUtils = {
        findOrCreateUser: function (store, session, principal) {
            return new Ember['default'].RSVP.Promise(function (resolve) {
                store.find("user", {
                    id: "me"
                }).then(function (foundUser) {
                    if (foundUser.content.length > 0) {
                        foundUser = foundUser.content[0];

                        foundUser.set("name", principal.name);
                        foundUser.set("email", principal.email);
                        foundUser.set("api_key", principal.api_key);
                        foundUser.set("created_at", principal.created_at);
                        foundUser.set("nitrogen_id", principal.id);
                        foundUser.set("last_connection", principal.last_connection);
                        foundUser.set("last_ip", principal.last_ip);
                        foundUser.set("nickname", principal.nickname);
                        foundUser.set("password", session.principal.password);
                        foundUser.set("updated_at", principal.updated_at);

                        foundUser.save().then(function (result) {
                            resolve(result);
                        });
                    }
                }, function (reason) {
                    console.log(reason);

                    var user = store.createRecord("user", {
                        id: "me"
                    });
                    user.set("name", principal.name);
                    user.set("email", principal.email);
                    user.set("api_key", principal.api_key);
                    user.set("created_at", principal.created_at);
                    user.set("nitrogen_id", principal.id);
                    user.set("last_connection", principal.last_connection);
                    user.set("last_ip", principal.last_ip);
                    user.set("nickname", principal.nickname);
                    user.set("password", session.principal.password);
                    user.set("updated_at", principal.updated_at);

                    user.save().then(function (result) {
                        resolve(result);
                    });
                });
            });
        },

        updateDevice: function (foundDevice, device, owner) {
            console.log("Found: ", device, " for Owner: ", owner);
            foundDevice.set("nitrogen_id", device.id);
            foundDevice.set("name", device.name);
            foundDevice.set("lastUpdated", device.updated_at);
            foundDevice.set("last_connection", device.last_connection);
            foundDevice.set("last_ip", device.last_ip);
            foundDevice.set("nickname", device.nickname);
            foundDevice.set("updated_at", device.updated_at);
            foundDevice.set("created_at", device.created_at);
            foundDevice.set("tags", device.tags);
            foundDevice.set("type", device.type);
            foundDevice.set("location", device.location);
            foundDevice.set("owner", owner);

            return foundDevice.save();
        },

        newDevice: function (store, device, owner) {
            console.log("New Device: ", device, " for Owner: ", owner);

            var newDevice = store.createRecord("device", {
                nitrogen_id: device.id,
                name: device.name,
                lastUpdated: device.updated_at,
                last_connection: device.last_connection,
                last_ip: device.last_ip,
                nickname: device.nickname,
                created_at: device.created_at,
                updated_at: device.updated_at,
                tags: device.tags,
                type: device.type,
                location: device.location,
                owner: owner
            });

            return newDevice.save();
        },

        removeDevices: function (principals, store) {
            return new Ember['default'].RSVP.Promise(function (resolve) {
                var principalIds = [];

                for (var i = 0; i < principals.length; i += 1) {
                    principalIds.push(principals[i].id);
                }

                store.find("device").then(function (foundDevices) {
                    if (foundDevices.content.length < 1) {
                        return resolve();
                    }

                    for (var i = 0; i < foundDevices.content.length; i += 1) {
                        if (principalIds.indexOf(foundDevices.content[i].get("nitrogen_id")) === -1) {
                            foundDevices.content[i].destroyRecord();
                        }
                    }

                    resolve();
                });
            });
        },

        lookupDevice: function (principal, user, store) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve) {
                console.log("Looking up device with nitrogen id " + principal.id);

                store.find("device", {
                    nitrogen_id: principal.id
                }).then(function (foundDevices) {
                    if (foundDevices.get("length") === 0) {
                        return self.newDevice(store, principal, user);
                    }

                    if (foundDevices.get("length") > 1) {
                        console.log("WARNING: Multiple devices in store for one Nitrogen id!");
                        console.log("Number of devices in store for this id: " + foundDevices.get("length"));
                    }

                    foundDevices.map(function (foundDevice) {
                        self.updateDevice(foundDevice, principal, user);
                    });

                    resolve();
                }, function () {
                    resolve(self.newDevice(store, principal, user));
                });
            });
        },

        updateOrCreateDevices: function (store, session, user) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                nitrogen.Principal.find(session, {
                    type: "device"
                }, {
                    skip: 0,
                    sort: {
                        last_connection: 1
                    }
                }, function (error, principals) {
                    var principalLookup;

                    if (error) {
                        console.log(error);
                        reject(error);
                    }

                    self.removeDevices(principals, store).then(function () {
                        principalLookup = principals.map(function (principal) {
                            return self.lookupDevice(principal, user, store);
                        });

                        Ember['default'].RSVP.all(principalLookup).then(function () {
                            resolve();
                        })["catch"](function (error) {
                            reject(error);
                        });
                    });
                });
            });
        }
    };

    exports['default'] = nitrogenEmberUtils;

});
define('oxide/views/application', ['exports', 'ember', 'oxide/utils/mobile'], function (exports, Ember, mobile) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        setupSidebar: (function () {
            var self = this;

            if (mobile['default'].matches) {
                $("#sidebar-container").css({
                    left: "-250px"
                });
                $("#main-content").css({
                    marginLeft: "0px"
                });
                $("#navbar").css({
                    marginLeft: "0px"
                });
            }

            $("#sidebar-container").swipe({
                swipeLeft: function () {
                    self.get("controller").send("toggleSidebar");
                },
                threshold: 20
            });
        }).on("didInsertElement")
    });

});
define('oxide/views/dashboard', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function () {}
    });
    // $(".dial").knob();

});
define('oxide/views/device', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function () {
            $("[type=checkbox]").bootstrapSwitch();
        }

    });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('oxide/config/environment', ['ember'], function(Ember) {
  var prefix = 'oxide';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("oxide/tests/test-helper");
} else {
  require("oxide/app")["default"].create({"nitrogen":{"host":"api.nitrogen.io","protocol":"https","http_port":443,"log_levels":["warn","error"]},"LOG_ACTIVE_GENERATION":true,"LOG_TRANSITIONS":true,"LOG_TRANSITIONS_INTERNAL":true,"LOG_VIEW_LOOKUPS":true,"name":"oxide","version":"0.3.0.4c92aba9"});
}

/* jshint ignore:end */
//# sourceMappingURL=oxide.map