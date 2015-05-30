/* jshint ignore:start */

/* jshint ignore:end */

define('oxide/adapters/application', ['exports', 'ember-json-api/json-api-adapter', 'oxide/config/environment'], function (exports, JsonApiAdapter, config) {

    'use strict';

    exports['default'] = JsonApiAdapter['default'].extend({
        host: config['default'].APP.API_HOST
    });

});
define('oxide/adapters/device', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].LSAdapter.extend({
        namespace: "ConnectedCar"
    });

});
define('oxide/adapters/user', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].LSAdapter.extend({
        namespace: "ConnectedCar"
    });

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
        init: function init() {
            nitrogenService = new nitrogen.Service(Config['default'].APP.nitrogen);
        },

        /**
        Restores the session from a set of session properties.
        @method restore
        @param {Object} data The data to restore the session from
        @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
        */
        restore: function restore(data) {
            var self = this;

            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                var appController = self.container.lookup("controller:application"),
                    session = appController.get("nitrogenSession"),
                    _nitrogenService = appController.get("nitrogenService"),
                    principal;

                // Let's take a look at our session here - if it looks like it's still good,
                // we can return right away
                if (session && session.principal && session.accessToken && _nitrogenService) {
                    return resolve({
                        user: session.principal,
                        accessToken: session.accessToken
                    });
                }

                principal = new nitrogen.User({
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
                        console.log("Authenticator: Resolving Login (Restore)", session);
                        appController = self.container.lookup("controller:application");
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
        authenticate: function authenticate(credentials) {
            var self = this;
            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                var user = new nitrogen.User({
                    nickname: "current",
                    email: $.trim(credentials.identification),
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

                            console.log("Authenticator: Resolving Login (Authenticate)", session);
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
        invalidate: function invalidate() {
            return new Ember['default'].RSVP.Promise(function (resolve) {
                console.log("Nitrogen authenticator invalidate.");
                nitrogenService = null;
                resolve({ user: null, accessToken: null });
            });
        }
    });

});
define('oxide/components/cc-spinner', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend({});

});
define('oxide/components/lf-outlet', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

	'use strict';

	exports['default'] = ember_internals.StaticOutlet;

});
define('oxide/components/lf-overlay', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var COUNTER = "__lf-modal-open-counter";

  exports['default'] = Ember['default'].Component.extend({
    tagName: "span",
    classNames: ["lf-overlay"],

    didInsertElement: function didInsertElement() {
      var body = Ember['default'].$("body");
      var counter = body.data(COUNTER) || 0;
      body.addClass("lf-modal-open");
      body.data(COUNTER, counter + 1);
    },

    willDestroy: function willDestroy() {
      var body = Ember['default'].$("body");
      var counter = body.data(COUNTER) || 0;
      body.data(COUNTER, counter - 1);
      if (counter < 2) {
        body.removeClass("lf-modal-open");
      }
    }
  });

});
define('oxide/components/liquid-child', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ["liquid-child"],
    attributeBindings: ["style"],
    style: Ember['default'].computed("visible", function () {
      return new Ember['default'].Handlebars.SafeString(this.get("visible") ? "" : "visibility:hidden");
    }),
    tellContainerWeRendered: Ember['default'].on("didInsertElement", function () {
      this.sendAction("didRender", this);
    })
  });

});
define('oxide/components/liquid-container', ['exports', 'ember', 'liquid-fire/growable', 'oxide/components/liquid-measured'], function (exports, Ember, Growable, liquid_measured) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(Growable['default'], {
    classNames: ["liquid-container"],
    classNameBindings: ["liquidAnimating"],

    lockSize: function lockSize(elt, want) {
      elt.outerWidth(want.width);
      elt.outerHeight(want.height);
    },

    unlockSize: function unlockSize() {
      var _this = this;

      var doUnlock = function () {
        if (!_this.isDestroyed) {
          _this.set("liquidAnimating", false);
        }
        var elt = _this.$();
        if (elt) {
          elt.css({ width: "", height: "" });
        }
      };
      if (this._scaling) {
        this._scaling.then(doUnlock);
      } else {
        doUnlock();
      }
    },

    startMonitoringSize: Ember['default'].on("didInsertElement", function () {
      this._wasInserted = true;
    }),

    actions: {

      willTransition: function willTransition(versions) {
        if (!this._wasInserted) {
          return;
        }

        // Remember our own size before anything changes
        var elt = this.$();
        this._cachedSize = liquid_measured.measure(elt);

        // And make any children absolutely positioned with fixed sizes.
        for (var i = 0; i < versions.length; i++) {
          goAbsolute(versions[i]);
        }

        // Apply '.liquid-animating' to liquid-container allowing
        // any customizable CSS control while an animating is occuring
        this.set("liquidAnimating", true);
      },

      afterChildInsertion: function afterChildInsertion(versions) {
        var elt = this.$();

        // Measure  children
        var sizes = [];
        for (var i = 0; i < versions.length; i++) {
          if (versions[i].view) {
            sizes[i] = liquid_measured.measure(versions[i].view.$());
          }
        }

        // Measure ourself again to see how big the new children make
        // us.
        var want = liquid_measured.measure(elt);
        var have = this._cachedSize || want;

        // Make ourself absolute
        this.lockSize(elt, have);

        // Make the children absolute and fixed size.
        for (i = 0; i < versions.length; i++) {
          goAbsolute(versions[i], sizes[i]);
        }

        // Kick off our growth animation
        this._scaling = this.animateGrowth(elt, have, want);
      },

      afterTransition: function afterTransition(versions) {
        for (var i = 0; i < versions.length; i++) {
          goStatic(versions[i]);
        }
        this.unlockSize();
      }
    }
  });

  function goAbsolute(version, size) {
    if (!version.view) {
      return;
    }
    var elt = version.view.$();
    var pos = elt.position();
    if (!size) {
      size = liquid_measured.measure(elt);
    }
    elt.outerWidth(size.width);
    elt.outerHeight(size.height);
    elt.css({
      position: "absolute",
      top: pos.top,
      left: pos.left
    });
  }

  function goStatic(version) {
    if (version.view) {
      version.view.$().css({ width: "", height: "", position: "" });
    }
  }

});
define('oxide/components/liquid-if', ['exports', 'ember', 'liquid-fire/ember-internals'], function (exports, Ember, ember_internals) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    _yieldInverse: ember_internals.inverseYieldMethod,
    hasInverse: Ember['default'].computed("inverseTemplate", function () {
      return !!this.get("inverseTemplate");
    })
  });

});
define('oxide/components/liquid-measured', ['exports', 'liquid-fire/mutation-observer', 'ember'], function (exports, MutationObserver, Ember) {

  'use strict';

  exports.measure = measure;

  exports['default'] = Ember['default'].Component.extend({

    didInsertElement: function didInsertElement() {
      var self = this;

      // This prevents margin collapse
      this.$().css({
        overflow: "auto"
      });

      this.didMutate();

      this.observer = new MutationObserver['default'](function (mutations) {
        self.didMutate(mutations);
      });
      this.observer.observe(this.get("element"), {
        attributes: true,
        subtree: true,
        childList: true,
        characterData: true
      });
      this.$().bind("webkitTransitionEnd", function () {
        self.didMutate();
      });
      // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
      window.addEventListener("unload", function () {
        self.willDestroyElement();
      });
    },

    willDestroyElement: function willDestroyElement() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },

    transitionMap: Ember['default'].inject.service("liquid-fire-transitions"),

    didMutate: function didMutate() {
      // by incrementing the running transitions counter here we prevent
      // tests from falling through the gap between the time they
      // triggered mutation the time we may actually animate in
      // response.
      var tmap = this.get("transitionMap");
      tmap.incrementRunningTransitions();
      Ember['default'].run.next(this, function () {
        this._didMutate();
        tmap.decrementRunningTransitions();
      });
    },

    _didMutate: function _didMutate() {
      var elt = this.$();
      if (!elt || !elt[0]) {
        return;
      }
      this.set("measurements", measure(elt));
    }

  });
  function measure($elt) {
    var width, height;

    // if jQuery sees a zero dimension, it will temporarily modify the
    // element's css to try to make its size measurable. But that's bad
    // for us here, because we'll get an infinite recursion of mutation
    // events. So we trap the zero case without hitting jQuery.

    if ($elt[0].offsetWidth === 0) {
      width = 0;
    } else {
      width = $elt.outerWidth();
    }
    if ($elt[0].offsetHeight === 0) {
      height = 0;
    } else {
      height = $elt.outerHeight();
    }

    return {
      width: width,
      height: height
    };
  }

});
define('oxide/components/liquid-modal', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ["liquid-modal"],
    currentContext: Ember['default'].computed.oneWay("owner.modalContexts.lastObject"),

    owner: Ember['default'].inject.service("liquid-fire-modals"),

    innerView: Ember['default'].computed("currentContext", function () {
      var self = this,
          current = this.get("currentContext"),
          name = current.get("name"),
          container = this.get("container"),
          component = container.lookup("component-lookup:main").lookupFactory(name);
      Ember['default'].assert("Tried to render a modal using component '" + name + "', but couldn't find it.", !!component);

      var args = Ember['default'].copy(current.get("params"));

      args.registerMyself = Ember['default'].on("init", function () {
        self.set("innerViewInstance", this);
      });

      // set source so we can bind other params to it
      args._source = Ember['default'].computed(function () {
        return current.get("source");
      });

      var otherParams = current.get("options.otherParams");
      var from, to;
      for (from in otherParams) {
        to = otherParams[from];
        args[to] = Ember['default'].computed.alias("_source." + from);
      }

      var actions = current.get("options.actions") || {};

      // Override sendAction in the modal component so we can intercept and
      // dynamically dispatch to the controller as expected
      args.sendAction = function (name) {
        var actionName = actions[name];
        if (!actionName) {
          this._super.apply(this, Array.prototype.slice.call(arguments));
          return;
        }

        var controller = current.get("source");
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(actionName);
        controller.send.apply(controller, args);
      };

      return component.extend(args);
    }),

    actions: {
      outsideClick: function outsideClick() {
        if (this.get("currentContext.options.dismissWithOutsideClick")) {
          this.send("dismiss");
        } else {
          proxyToInnerInstance(this, "outsideClick");
        }
      },
      escape: function escape() {
        if (this.get("currentContext.options.dismissWithEscape")) {
          this.send("dismiss");
        } else {
          proxyToInnerInstance(this, "escape");
        }
      },
      dismiss: function dismiss() {
        var source = this.get("currentContext.source"),
            proto = source.constructor.proto(),
            params = this.get("currentContext.options.withParams"),
            clearThem = {};

        for (var key in params) {
          if (proto[key] instanceof Ember['default'].ComputedProperty) {
            clearThem[key] = undefined;
          } else {
            clearThem[key] = proto[key];
          }
        }
        source.setProperties(clearThem);
      }
    }
  });

  function proxyToInnerInstance(self, message) {
    var vi = self.get("innerViewInstance");
    if (vi) {
      vi.send(message);
    }
  }

});
define('oxide/components/liquid-outlet', ['exports', 'ember', 'liquid-fire/ember-internals'], function (exports, Ember, ember_internals) {

	'use strict';

	exports['default'] = Ember['default'].Component.extend(ember_internals.OutletBehavior);

});
define('oxide/components/liquid-spacer', ['exports', 'oxide/components/liquid-measured', 'liquid-fire/growable', 'ember'], function (exports, liquid_measured, Growable, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend(Growable['default'], {
    enabled: true,

    didInsertElement: function didInsertElement() {
      var child = this.$("> div");
      var measurements = this.myMeasurements(liquid_measured.measure(child));
      this.$().css({
        overflow: "hidden",
        outerWidth: measurements.width,
        outerHeight: measurements.height
      });
    },

    sizeChange: Ember['default'].observer("measurements", function () {
      if (!this.get("enabled")) {
        return;
      }
      var elt = this.$();
      if (!elt || !elt[0]) {
        return;
      }
      var want = this.myMeasurements(this.get("measurements"));
      var have = liquid_measured.measure(this.$());
      this.animateGrowth(elt, have, want);
    }),

    // given our child's outerWidth & outerHeight, figure out what our
    // outerWidth & outerHeight should be.
    myMeasurements: function myMeasurements(childMeasurements) {
      var elt = this.$();
      return {
        width: childMeasurements.width + sumCSS(elt, padding("width")) + sumCSS(elt, border("width")),
        height: childMeasurements.height + sumCSS(elt, padding("height")) + sumCSS(elt, border("height"))
      };
      //if (this.$().css('box-sizing') === 'border-box') {
    }

  });

  function sides(dimension) {
    return dimension === "width" ? ["Left", "Right"] : ["Top", "Bottom"];
  }

  function padding(dimension) {
    var s = sides(dimension);
    return ["padding" + s[0], "padding" + s[1]];
  }

  function border(dimension) {
    var s = sides(dimension);
    return ["border" + s[0] + "Width", "border" + s[1] + "Width"];
  }

  function sumCSS(elt, fields) {
    var accum = 0;
    for (var i = 0; i < fields.length; i++) {
      var num = parseFloat(elt.css(fields[i]), 10);
      if (!isNaN(num)) {
        accum += num;
      }
    }
    return accum;
  }

});
define('oxide/components/liquid-versions', ['exports', 'ember', 'liquid-fire/ember-internals'], function (exports, Ember, ember_internals) {

  'use strict';

  var get = Ember['default'].get;
  var set = Ember['default'].set;

  exports['default'] = Ember['default'].Component.extend({
    tagName: "",
    name: "liquid-versions",

    transitionMap: Ember['default'].inject.service("liquid-fire-transitions"),

    appendVersion: Ember['default'].on("init", Ember['default'].observer("value", function () {
      var versions = get(this, "versions");
      var firstTime = false;
      var newValue = get(this, "value");
      var oldValue;

      if (!versions) {
        firstTime = true;
        versions = Ember['default'].A();
      } else {
        oldValue = versions[0];
      }

      // TODO: may need to extend the comparison to do the same kind of
      // key-based diffing that htmlbars is doing.
      if (!firstTime && (!oldValue && !newValue || oldValue === newValue)) {
        return;
      }

      this.notifyContainer("willTransition", versions);
      var newVersion = {
        value: newValue,
        shouldRender: newValue || get(this, "renderWhenFalse")
      };
      versions.unshiftObject(newVersion);

      this.firstTime = firstTime;
      if (firstTime) {
        set(this, "versions", versions);
      }

      if (!newVersion.shouldRender && !firstTime) {
        this._transition();
      }
    })),

    _transition: function _transition() {
      var _this = this;

      var versions = get(this, "versions");
      var transition;
      var firstTime = this.firstTime;
      this.firstTime = false;

      this.notifyContainer("afterChildInsertion", versions);

      transition = get(this, "transitionMap").transitionFor({
        versions: versions,
        parentElement: Ember['default'].$(ember_internals.containingElement(this)),
        use: get(this, "use"),
        // Using strings instead of booleans here is an
        // optimization. The constraint system can match them more
        // efficiently, since it treats boolean constraints as generic
        // "match anything truthy/falsy" predicates, whereas string
        // checks are a direct object property lookup.
        firstTime: firstTime ? "yes" : "no",
        helperName: get(this, "name")
      });

      if (this._runningTransition) {
        this._runningTransition.interrupt();
      }
      this._runningTransition = transition;

      transition.run().then(function (wasInterrupted) {
        // if we were interrupted, we don't handle the cleanup because
        // another transition has already taken over.
        if (!wasInterrupted) {
          _this.finalizeVersions(versions);
          _this.notifyContainer("afterTransition", versions);
        }
      }, function (err) {
        _this.finalizeVersions(versions);
        _this.notifyContainer("afterTransition", versions);
        throw err;
      });
    },

    finalizeVersions: function finalizeVersions(versions) {
      versions.replace(1, versions.length - 1);
    },

    notifyContainer: function notifyContainer(method, versions) {
      var target = get(this, "notify");
      if (target) {
        target.send(method, versions);
      }
    },

    actions: {
      childDidRender: function childDidRender(child) {
        var version = get(child, "version");
        set(version, "view", child);
        this._transition();
      }
    }

  });

});
define('oxide/components/liquid-with', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    name: "liquid-with"
  });

});
define('oxide/components/lm-container', ['exports', 'ember', 'liquid-fire/tabbable'], function (exports, Ember) {

  'use strict';

  /*
     Parts of this file were adapted from ic-modal

     https://github.com/instructure/ic-modal
     Released under The MIT License (MIT)
     Copyright (c) 2014 Instructure, Inc.
  */

  var lastOpenedModal = null;
  Ember['default'].$(document).on("focusin", handleTabIntoBrowser);

  function handleTabIntoBrowser() {
    if (lastOpenedModal) {
      lastOpenedModal.focus();
    }
  }

  exports['default'] = Ember['default'].Component.extend({
    classNames: ["lm-container"],
    attributeBindings: ["tabindex"],
    tabindex: 0,

    keyUp: function keyUp(event) {
      // Escape key
      if (event.keyCode === 27) {
        this.sendAction();
      }
    },

    keyDown: function keyDown(event) {
      // Tab key
      if (event.keyCode === 9) {
        this.constrainTabNavigation(event);
      }
    },

    didInsertElement: function didInsertElement() {
      this.focus();
      lastOpenedModal = this;
    },

    willDestroy: function willDestroy() {
      lastOpenedModal = null;
    },

    focus: function focus() {
      if (this.get("element").contains(document.activeElement)) {
        // just let it be if we already contain the activeElement
        return;
      }
      var target = this.$("[autofocus]");
      if (!target.length) {
        target = this.$(":tabbable");
      }

      if (!target.length) {
        target = this.$();
      }

      target[0].focus();
    },

    constrainTabNavigation: function constrainTabNavigation(event) {
      var tabbable = this.$(":tabbable");
      var finalTabbable = tabbable[event.shiftKey ? "first" : "last"]()[0];
      var leavingFinalTabbable = finalTabbable === document.activeElement ||
      // handle immediate shift+tab after opening with mouse
      this.get("element") === document.activeElement;
      if (!leavingFinalTabbable) {
        return;
      }
      event.preventDefault();
      tabbable[event.shiftKey ? "last" : "first"]()[0].focus();
    },

    click: function click(event) {
      if (event.target === this.get("element")) {
        this.sendAction("clickAway");
      }
    }
  });

});
define('oxide/components/materialize-button-submit', ['exports', 'ember-cli-materialize/components/materialize-button-submit'], function (exports, MaterializeButtonSubmit) {

	'use strict';

	exports['default'] = MaterializeButtonSubmit['default'];

});
define('oxide/components/materialize-button', ['exports', 'ember-cli-materialize/components/materialize-button'], function (exports, MaterializeButton) {

	'use strict';

	exports['default'] = MaterializeButton['default'];

});
define('oxide/components/materialize-card-action', ['exports', 'ember-cli-materialize/components/materialize-card-action'], function (exports, MaterializeCardAction) {

	'use strict';

	exports['default'] = MaterializeCardAction['default'];

});
define('oxide/components/materialize-card-content', ['exports', 'ember-cli-materialize/components/materialize-card-content'], function (exports, MaterializeCardContent) {

	'use strict';

	exports['default'] = MaterializeCardContent['default'];

});
define('oxide/components/materialize-card-panel', ['exports', 'ember-cli-materialize/components/materialize-card-panel'], function (exports, MaterializeCardPanel) {

	'use strict';

	exports['default'] = MaterializeCardPanel['default'];

});
define('oxide/components/materialize-card-reveal', ['exports', 'ember-cli-materialize/components/materialize-card-reveal'], function (exports, MaterializeCardReveal) {

	'use strict';

	exports['default'] = MaterializeCardReveal['default'];

});
define('oxide/components/materialize-card', ['exports', 'ember-cli-materialize/components/materialize-card'], function (exports, MaterializeCard) {

	'use strict';

	exports['default'] = MaterializeCard['default'];

});
define('oxide/components/materialize-collapsible-card', ['exports', 'ember-cli-materialize/components/materialize-collapsible-card'], function (exports, MaterializeCollapsibleCard) {

	'use strict';

	exports['default'] = MaterializeCollapsibleCard['default'];

});
define('oxide/components/materialize-collapsible', ['exports', 'ember-cli-materialize/components/materialize-collapsible'], function (exports, MaterializeCollapsible) {

	'use strict';

	exports['default'] = MaterializeCollapsible['default'];

});
define('oxide/components/materialize-input', ['exports', 'ember-cli-materialize/components/materialize-input'], function (exports, materializeInput) {

	'use strict';

	exports['default'] = materializeInput['default'];

});
define('oxide/components/materialize-navbar', ['exports', 'ember-cli-materialize/components/materialize-navbar'], function (exports, MaterializeNavBar) {

	'use strict';

	exports['default'] = MaterializeNavBar['default'];

});
define('oxide/components/ox-map', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    /* global Microsoft */

    exports['default'] = Ember['default'].Component.extend({
        zoom: 6,
        showDashboard: false,

        /**
         * Creates the map object and assigns a object reference to
         * 'mapReference', if given
         */
        setup: (function () {
            // Create map
            var map = new Microsoft.Maps.Map(document.getElementById("map"), {
                center: new Microsoft.Maps.Location(47.669444, -122.123889),
                credentials: "Akbhia6_9IoahE9Q2TyAVORP_IHbhkxmTiy25f8WXYpnt_pzIA0AhgvyDVHKJkhi",
                enableSearchLogo: false,
                zoom: this.get("zoom"),
                showDashboard: this.get("showDashboard"),
                enableHighDpi: true,
                disableBirdseye: true,
                enableClickableLogo: false,
                inertiaIntensity: 0.5
            });

            // Get current location
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var options = map.getOptions();

                    if (options) {
                        var lat = position.coords.latitude;
                        var lon = position.coords.longitude;
                        options.center = new Microsoft.Maps.Location(lat, lon);
                    }

                    map.setView(options);
                });
            }

            this.set("mapReference", map);
        }).on("didInsertElement")
    });

});
define('oxide/controllers/application', ['exports', 'ember', 'oxide/config/environment'], function (exports, Ember, Config) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        version: Config['default'].APP.version,
        fullConfig: Config['default'].APP
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
        selectedCar: null,
        selectedDriver: null,
        showOnlyActiveCars: true,
        selectedTripPathEntityId: undefined,
        driverViewVisible: false,

        /**
         * An array containing all the drivers in the store (aka on the API)
         */
        drivers: Ember['default'].computed(function () {
            return this.store.find("driver");
        }),

        /**
         * Returns the trips driven by the currently selected driver
         * @return {DS.PromiseArray} The trips driven by the selected driver
         */
        selectedDriverTrips: Ember['default'].computed(function () {
            var selectedDriver = this.get("selectedDriver");

            if (selectedDriver) {
                return this.store.find("trips", { driver: selectedDriver });
            } else {
                return [];
            }
        }),

        /**
         * Are any cars in the model?
         * @return {boolean}
         */
        carsConnected: Ember['default'].computed("model", function () {
            var model = this.get("model");

            if (model.content.length > 0) {
                return true;
            } else {
                return false;
            }
        }),

        /**
         * A DS.PromiseArray containing all the devices that are currently active
         * (as determined by their vehicle)
         * @return {DS.PromiseArray}   [Devices (Vehicles) currently active]
         */
        activeCars: Ember['default'].computed(function () {
            return this.store.filter("device", function (device) {
                return device.get("vehicle.isActive");
            });
        }),

        /**
         * Creates a path object on the map entity collection,
         * allowing us to later just modify that path object
         * if the user selects a trip
         */
        setupSelectedPath: (function () {
            var _this = this;

            Ember['default'].run.scheduleOnce("afterRender", function () {
                var map = _this.get("mapReference"),
                    pathOptions = {
                    strokeColor: new Microsoft.Maps.Color.fromHex("#DE0416"),
                    strokeThickness: 5
                },
                    path = new Microsoft.Maps.Polyline([], pathOptions);

                if (map) {
                    map.entities.insert(path, 0);
                } else {
                    console.info("Bing Maps Reference not found, trip path display might malfuction");
                }
            });
        }).on("init"),

        /**
         * Add all cars to the 'tracked' list on init
         */
        trackAllCars: (function () {
            var _this = this;

            var replaceCars = [];

            this.store.find("device").then(function (devices) {
                if (devices && devices.content) {
                    for (var i = 0; i < devices.content.length; i += 1) {
                        var device = devices.content[i];
                        device.set("trackOnMap", true);
                        device.save();
                        replaceCars.push(device.get("nitrogen_id"));
                    }
                }

                _this.set("trackedCars", replaceCars);
            });
        }).on("init"),

        /**
         * Subscribe to Nitrogen on init, assign a handler for incoming socket messages
         */
        subscribeToNitrogen: (function () {
            this.get("nitrogenController").send("subscribeToNitrogen", this, "handleSocketMessage");
        }).on("init"),

        /**
         * Observes `trackedCars` to sync map pushpins and tracked cars - if a car is marked as tracked,
         * this method will schedule `addOrRemoveCars` in the Ember Run Loop, ensuring that the map only
         * contains pushpins for cars actually tracked.
         */
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

            function addOrRemoveCars() {
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
                        self.store.find("device", {
                            nitrogen_id: trackedCars[i]
                        }).then(handleFoundDevices);
                    }
                }
            }

            Ember['default'].run.scheduleOnce("afterRender", addOrRemoveCars);
        }).observes("trackedCars.[]"),

        actions: {
            /**
             * Toggles whether or not a car should be tracked on map
             * @param  {Ember Data Record} device  - The car to be tracked
             */
            toggleCar: function toggleCar(device) {
                var trackedCars = this.get("trackedCars");

                device.toggleProperty("trackOnMap");

                if (device.get("trackOnMap") === true) {
                    trackedCars.pushObject(device.get("nitrogen_id"));
                } else {
                    trackedCars.removeObject(device.get("nitrogen_id"));
                }
            },

            /**
             * Handles a locations array for a given device, cleaning the individual
             * 'location' data points and putting them into an array property on a
             * given car.
             *
             * This method is called when Nitrogen messages with location data are
             * retrieved.
             * @param  {array}   locations     - Locations array (format: {latitude: 1, longitude: 1, speed: 1, heading: 1, timestamp: 1})
             * @param  {string}   principalId  - Id of the car the locations should be attached to
             * @param  {Function} callback
             * @return {Ember Data Record}     - DS Record of the car the locations were added to
             */
            handleLocations: function handleLocations(locations, principalId, callback) {
                var self = this;

                if (locations.length > 0) {
                    this.store.find("device", {
                        nitrogen_id: principalId
                    }).then(function (foundDevices) {
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

            /**
             * If a car is added to the map and the last location has to be retrieved, this callback is used
             * to handleLocations followed by adding the car to the map.
             * @param  {array}   locations     - Locations array (format: {latitude: 1, longitude: 1, speed: 1, heading: 1, timestamp: 1})
             * @param  {string}   principalId  - Id of the car the locations should be attached to
             */
            handleLastLocation: function handleLastLocation(locations, principalId) {
                if (locations && principalId) {
                    this.send("handleLocations", locations, principalId, "addCarToMap");
                }
            },

            /**
             * Handles incoming socket messages from Nitrogen
             * @param  {object} message - Nitrogen message
             */
            handleSocketMessage: function handleSocketMessage(message) {
                var locations = [];

                if (message && message.from) {
                    locations.push(message);
                    this.send("handleLocations", locations, message.from, "updateCar");
                }
            },

            /**
             * Updates a car on the map, moving his pushpin and drawing the path
             * @param  {Ember Data Record} device - Car to update on the map
             */
            updateCar: function updateCar(device) {
                var map = this.get("mapReference"),
                    name = device.get("nitrogen_id"),
                    mapEntityTracker = this.get("mapEntityTracker"),
                    locations = device.get("gps"),
                    lat = locations[locations.length - 1].latitude,
                    lon = locations[locations.length - 1].longitude,
                    lastLocation = {
                    longitude: lon,
                    latitude: lat
                },
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

            /**
             * Centers the map on a given location
             * @param  {object} location - The location to center on (format: {latitude: 1, longitude: 1})
             */
            centerMap: function centerMap(location) {
                var map = this.get("mapReference"),
                    mapOptions = map.getOptions();

                mapOptions.zoom = 15;
                mapOptions.center = {
                    latitude: location.latitude,
                    longitude: location.longitude
                };
                map.setView(mapOptions);
            },

            /**
             * Centers the map on a given car
             * @param  {Ember Data Record} device - Car to center on
             */
            centerOnCar: function centerOnCar(device) {
                var locations = device.get("gps"),
                    lastLocation = locations[locations.length - 1];

                if (lastLocation) {
                    this.send("centerMap", {
                        latitude: lastLocation.latitude,
                        longitude: lastLocation.longitude
                    });
                }
            },

            /**
             * Adds a given car to the map
             * @param  {Ember Data Record} device - Car to add
             */
            addCarToMap: function addCarToMap(device) {
                var locations = device.get("gps"),
                    lastLocation = locations[locations.length - 1],
                    iconUrl = "assets/img/carIcon_smaller.png",
                    iconOptions = {
                    icon: iconUrl,
                    height: 40,
                    width: 40,
                    typeName: "tooltipped"
                },
                    map = this.get("mapReference"),
                    mapLocations = [],
                    pathOptions = {
                    strokeColor: new Microsoft.Maps.Color.fromHex("#4caf50"),
                    strokeThickness: 5
                },
                    path,
                    pin,
                    entityLength;

                for (var i = 0; i < locations.length; i += 1) {
                    mapLocations.push({
                        latitude: locations[i].latitude,
                        longitude: locations[i].longitude
                    });
                }

                if (mapLocations && mapLocations.length > 0) {
                    pin = new Microsoft.Maps.Pushpin({
                        latitude: lastLocation.latitude,
                        longitude: lastLocation.longitude
                    }, iconOptions);
                    path = new Microsoft.Maps.Polyline(mapLocations, pathOptions);

                    // Save index of entities pushed (so we can update them later)
                    entityLength = map.entities.getLength();
                    this.get("mapEntityTracker").pushObject({
                        name: device.get("nitrogen_id"),
                        pin: entityLength,
                        path: entityLength + 1
                    });

                    // Tooltip
                    this.send("createTooltipHandlers", pin, device.get("name"), device);

                    // Push objects to map
                    map.entities.push(pin);
                    map.entities.push(path);
                }
            },

            /**
             * Adds a tooltip and a click handler for a pushpin
             * @param {object} pin pushin
             */
            createTooltipHandlers: function createTooltipHandlers(pin, tooltipText, device) {
                if (!pin || !tooltipText || !Microsoft || !Microsoft.Maps.Events) {
                    return;
                }

                var self = this;

                // Create Mouse Over Handler
                Microsoft.Maps.Events.addHandler(pin, "mouseover", function (e) {
                    var target = e.target.cm1002_er_etr.dom,
                        tiprCont = ".tipr_container_bottom",
                        wt,
                        ml;

                    var out = "<div class=\"tipr_container_bottom\"><div class=\"tipr_content\">" + tooltipText + "</div></div>";

                    $(target).after(out);

                    wt = $(tiprCont).outerWidth();
                    ml = -(wt / 2 + 20);

                    $(tiprCont).css("top", e.pageY + 20);
                    $(tiprCont).css("left", e.pageX);
                    $(tiprCont).css("margin-left", ml + "px");

                    $(tiprCont).fadeIn("200");
                });

                // Create Mouse Out Handler
                Microsoft.Maps.Events.addHandler(pin, "mouseout", function () {
                    $(".tipr_container_bottom").remove();
                });

                // Create Click Handler
                Microsoft.Maps.Events.addHandler(pin, "click", function () {
                    self.send("selectCar", device);
                });
            },

            /**
             * Marks a given car as 'selected'
             * @param  {Ember Data Record} device - Car to select
             */
            selectCar: function selectCar(device) {
                Ember['default'].$(".carlist").addClass("expanded");

                this.set("selectedCar", device);
                this.send("centerOnCar", device);
            },

            /**
             * Sets the currently selected car to null
             */
            deselectCar: function deselectCar() {
                Ember['default'].$(".carlist").removeClass("expanded");

                this.set("selectedCar", null);
                this.send("clearTripPath");
            },

            /**
             * Selects a trip, getting it's individual trip events and
             * adding a path for said events to the map
             * @param  {DS.Model trip} trip
             */
            selectTrip: function selectTrip(trip) {
                var events = trip.get("tripEvents").content.currentState;
                this.send("drawPathFromEvents", events);
            },

            /**
             * Draws a 'selected trip' path on the map
             * @param  {Array of DS.Model TripEvent} events
             */
            drawPathFromEvents: function drawPathFromEvents(events) {
                var pathLocations = [],
                    map = this.get("mapReference"),
                    path;

                // First, get the selected path. It should always be the first entity
                // on the map
                path = map.entities.get(0);

                // Then, add the path from the events
                for (var i = 0; i < events.length; i = i + 1) {
                    pathLocations.push({
                        latitude: events[i].get("location").get("latitude"),
                        longitude: events[i].get("location").get("longitude")
                    });
                }

                path.setLocations(pathLocations);

                // Center map on beginning of path
                if (events && events.length > 0) {
                    this.send("centerMap", {
                        latitude: events[0].get("location").get("longitude"),
                        longitude: events[0].get("location").get("latitude")
                    });
                }
            },

            /**
             * Resets the path for the currently selected trip by
             * filling said path on the map EntityCollection with 0 locations
             */
            clearTripPath: function clearTripPath() {
                var map = this.get("mapReference"),
                    path = map.entities.get(0);

                path.setLocations([]);
            },

            /**
             * Toggles between the 'Drivers' and the 'Vehicles' card
             */
            toggleDriverView: function toggleDriverView() {
                this.toggleProperty("driverViewVisible");
                this.send("toggleDriverIcon");
            },

            /**
             * Marks a given driver as 'selected'
             * @param  {Ember Data Record} device - Driver to select
             */
            selectDriver: function selectDriver(driver) {
                Ember['default'].$(".driverlist").addClass("expanded");

                this.set("selectedDriver", driver);
                this.send("centerOnCar", driver);
            },

            /**
             * Sets the currently selected driver to null
             */
            deselectDriver: function deselectDriver() {
                Ember['default'].$(".driverlist").removeClass("expanded");

                this.set("selectedDriver", null);
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

        init: function init() {
            this._super();
            this.set("loading", false);
        },

        actions: {
            /**
             * Authenticates and displays an error if anything goes wrong
             */
            authenticate: function authenticate() {
                var self = this;
                this.set("loading", true);

                this._super().then(function () {
                    Ember['default'].Logger.debug("Session authentication succeeded");
                }, function (error) {
                    self.set("loading", false);
                    Ember['default'].Logger.debug("Session authentication failed with message:", error.message);
                    self.notify.warning({ message: "Incorrect email or password.", closeAfter: 7000 });
                });
            },

            /**
             * Uses jQuery to programmitcally submit the login form
             */
            login: function login() {
                Ember['default'].$("#login").submit();
                return false;
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
            /**
             * Subcribes to the Nitrogen Socket Message Stream, calling a
             * callback on a given controller
             * @param  {Controller}   originalController - The controller on which to call the callback
             * @param  {string}       callback - The callback (passed as a string, since called via Ember Run Loop)
             */
            subscribeToNitrogen: function subscribeToNitrogen(originalController, callback) {
                var appController = this.get("appController"),
                    nitrogenSession = appController.get("nitrogenSession");

                if (this.get("subscribedToNitrogen") || !nitrogenSession) {
                    return;
                }

                nitrogenSession.onMessage({ type: "location" }, function (message) {
                    originalController.send(callback, message);
                });

                this.set("subscribedToNitrogen", true);
            },

            /**
             * Gets the last message for a given car from Nitrogen
             * @param  {string}       principalId        - Id of the car for which the last message shall be retreived
             * @param  {number}       messageLimit       - Number of last messages to retreive (usually 1)
             * @param  {Controller}   originalController - The controller on which to call the callback
             * @param  {string}       callback           - The callback (passed as a string, since called via Ember Run Loop)
             */
            getLastMessage: function getLastMessage(principalId, messageLimit, originalController, callback) {
                var appController = this.get("appController"),
                    nitrogenSession = appController.get("nitrogenSession"),
                    limit = messageLimit ? messageLimit : 0;

                if (nitrogenSession && principalId) {
                    nitrogen.Message.find(nitrogenSession, {
                        type: "location", from: principalId
                    }, {
                        sort: { ts: -1 },
                        limit: limit
                    }, function (err, locations) {
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
        title: "Settings",
        needs: ["application"],
        config: Ember['default'].computed.alias("controllers.application.fullConfig"),

        configString: (function () {
            return JSON.stringify(this.get("config"), null, "\t");
        }).property("config"),

        connectionSecure: Ember['default'].computed.equal("config.nitrogen.http_port", "https"),

        localStorageSize: (function () {
            var result = 0;

            for (var i in localStorage) {
                if (localStorage.hasOwnProperty(localStorage[i])) {
                    result = result + localStorage[i].length * 2 / 1024 / 1024;
                }
            }

            return result.toFixed(2);
        }).property(),

        actions: {
            /**
             * The nuclear option: Clears the local storage
             */
            clearLocalStorage: function clearLocalStorage() {
                window.localStorage.clear();
                this.send("invalidateSession");
            }
        }

    });

});
define('oxide/helpers/lf-yield-inverse', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

  'use strict';

  exports['default'] = {
    isHTMLBars: true,
    helperFunction: ember_internals.inverseYieldHelper
  };

});
define('oxide/helpers/liquid-bind', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

	'use strict';

	exports['default'] = ember_internals.makeHelperShim("liquid-bind");

});
define('oxide/helpers/liquid-if', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

  'use strict';

  exports['default'] = ember_internals.makeHelperShim("liquid-if", function (params, hash, options) {
    hash.helperName = "liquid-if";
    hash.inverseTemplate = options.inverse;
  });

});
define('oxide/helpers/liquid-outlet', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

  'use strict';

  exports['default'] = ember_internals.makeHelperShim("liquid-outlet", function (params, hash) {
    hash._outletName = params[0] || "main";
  });

});
define('oxide/helpers/liquid-unless', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

  'use strict';

  exports['default'] = ember_internals.makeHelperShim("liquid-if", function (params, hash, options) {
    hash.helperName = "liquid-unless";
    hash.inverseTemplate = options.template;
    options.template = options.inverse;
  });

});
define('oxide/helpers/liquid-with', ['exports', 'liquid-fire/ember-internals'], function (exports, ember_internals) {

	'use strict';

	exports['default'] = ember_internals.makeHelperShim("liquid-with");

});
define('oxide/helpers/pretty-date', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.prettyDate = prettyDate;

  /**
   * Uses Moment to return a pretty date
   * @param  {number} timestamp - Timestamp
   * @return {string}           - Pretty Moment date string
   */
  function prettyDate(timestamp) {
    return moment(timestamp).calendar();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(prettyDate);

});
define('oxide/helpers/round-number', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.round = round;

    /**
     * Takes a number and returns a rounded version
     * @param  {number} input
     * @param  {number} points
     * @return {number}
     */
    function round(input, points) {
        if (points === undefined) {
            points = 2;
        }
        return parseFloat(input).toFixed(points);
    }

    exports['default'] = Ember['default'].Handlebars.makeBoundHelper(round);

});
define('oxide/helpers/time-length', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.timeLength = timeLength;

    function timeLength(timestamps) {
        if (timestamps && timestamps.length >= 2) {
            var diff = moment(timestamps[1]).diff(moment(timestamps[0]));
            return moment.duration(diff).humanize();
        }
        return "";
    }

    exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(timeLength);

});
define('oxide/initializers/app-version', ['exports', 'oxide/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
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
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('oxide/initializers/link-view', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    Ember['default'].LinkView.reopen({
      attributeBindings: ["data-activates"]
    });
  }

  exports['default'] = {
    name: "link-view",
    initialize: initialize
  };
  /* container, application */

});
define('oxide/initializers/liquid-fire', ['exports', 'liquid-fire/router-dsl-ext'], function (exports) {

  'use strict';

  // This initializer exists only to make sure that the following import
  // happens before the app boots.
  exports['default'] = {
    name: "liquid-fire",
    initialize: function initialize() {}
  };

});
define('oxide/initializers/nitrogen', ['exports', 'oxide/authenticators/nitrogen'], function (exports, nitrogenAuth) {

  'use strict';

  exports['default'] = {
    name: "authentication",
    initialize: function initialize(container) {
      container.register("authenticator:nitrogen", nitrogenAuth['default']);
    }
  };

});
define('oxide/initializers/simple-auth', ['exports', 'simple-auth/configuration', 'simple-auth/setup', 'oxide/config/environment'], function (exports, Configuration, setup, ENV) {

  'use strict';

  exports['default'] = {
    name: "simple-auth",
    initialize: function initialize(container, application) {
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
        vehicle: DS['default'].belongsTo("vehicle", { async: true })
    });

    exports['default'] = Device;

});
define('oxide/models/driver', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    driverScore: DS['default'].attr("number")
  });

});
define('oxide/models/event', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        eventType: DS['default'].attr("string"),
        timestamp: DS['default'].attr("string"),
        speed: DS['default'].attr("number"),
        location: DS['default'].belongsTo("location", { embedded: "always" }),
        trip: DS['default'].belongsTo("trip")
    });

});
define('oxide/models/location', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        tripEvent: DS['default'].belongsTo("event"),
        latitude: DS['default'].attr("number"),
        longitude: DS['default'].attr("number"),
        altitude: DS['default'].attr("number"),
        direction: DS['default'].attr("number")
    });

});
define('oxide/models/trip', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    vehicle: DS['default'].belongsTo("vehicle", { async: true }),
    tripEvents: DS['default'].hasMany("event", { embedded: "always", async: true }),
    driver: DS['default'].belongsTo("driver", { async: true })
  });

});
define('oxide/models/user', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
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
        updated_at: DS['default'].attr("string")
    });

});
define('oxide/models/vehicle', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        trips: DS['default'].hasMany("trip", { async: true }),
        name: DS['default'].attr("string"),
        isActive: DS['default'].attr("boolean", { defaultValue: false }),
        vin: DS['default'].attr("string"),
        make: DS['default'].attr("string"),
        model: DS['default'].attr("string"),
        production_year: DS['default'].attr("string"),
        mileage: DS['default'].attr("string")
    });

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
            /**
             * Once the session has been invalidated, we reload the whole page to flush caches
             */
            sessionInvalidationSucceeded: function sessionInvalidationSucceeded() {
                // Force reload to empty all cached data
                window.location = "http://" + document.location.host;
            }
        }

    });

});
define('oxide/routes/dashboard', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
        model: function model() {
            return this.store.find("device");
        },

        actions: {
            /**
             * Toggle the side/hamburger navigation
             */
            toggleSideNav: function toggleSideNav() {
                var $container = Ember['default'].$(".main-container"),
                    $menu = Ember['default'].$(".menu-flyout");

                // If the menu isn't out, pull it out
                $container.toggleClass("expanded");
                $menu.toggleClass("expanded");
            },

            /**
             * Toggle the driver view
             */
            toggleDriverIcon: function toggleDriverIcon() {
                Ember['default'].$("#driversMenuButton").toggleClass("selected");
            },

            /**
             * Toggle the list of vehicles
             */
            toggleVehicleList: function toggleVehicleList() {
                var $container = Ember['default'].$(".vehicle-list"),
                    $icon = Ember['default'].$(".vehicle-list > .card-content > .card-title > i");

                $container.toggleClass("collapsed");

                if ($icon.hasClass("mdi-navigation-expand-less")) {
                    $icon.removeClass("mdi-navigation-expand-less");
                    $icon.addClass("mdi-navigation-expand-more");
                } else {
                    $icon.removeClass("mdi-navigation-expand-more");
                    $icon.addClass("mdi-navigation-expand-less");
                }
            }
        }
    });

});
define('oxide/routes/login', ['exports', 'ember', 'simple-auth/mixins/unauthenticated-route-mixin'], function (exports, Ember, UnauthenticatedRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(UnauthenticatedRouteMixin['default'], {});

});
define('oxide/serializers/application', ['exports', 'ember-json-api/json-api-serializer', 'ember-data'], function (exports, JsonApiSerializer, DS) {

    'use strict';

    exports['default'] = JsonApiSerializer['default'].extend(DS['default'].EmbeddedRecordsMixin, {
        attrs: {
            // tell the serializer that these attribute
            // names are always expected to be embedded
            // in the doc, and not linked
            event: { embedded: "always" },
            location: { embedded: "always" },
            tripEvents: { embedded: "always" }
        }
    });

});
define('oxide/serializers/device', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].LSSerializer.extend({
        // TODO: Update with the actual principal.id
        extractSingle: function extractSingle(store, typeClass, payload) {
            payload.vehicle = "54d01ed20eabba6304eded64";
            return this._super(store, typeClass, payload);
        }
    });

});
define('oxide/serializers/user', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].LSSerializer.extend({});

});
define('oxide/services/liquid-fire-modals', ['exports', 'liquid-fire/modals'], function (exports, Modals) {

	'use strict';

	exports['default'] = Modals['default'];

});
define('oxide/services/liquid-fire-transitions', ['exports', 'liquid-fire/transition-map'], function (exports, TransitionMap) {

	'use strict';

	exports['default'] = TransitionMap['default'];

});
define('oxide/templates/-car-list-item', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
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
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","collection-item car");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        dom.setAttribute(el3,"class","vin");
        var el4 = dom.createTextNode("VIN#");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
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
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 3]),0,0);
        var morph2 = dom.createMorphAt(element0,5,5);
        element(env, element0, context, "action", ["selectCar", get(env, context, "car")], {});
        content(env, morph0, context, "car.name");
        content(env, morph1, context, "car.vehicle.vin");
        block(env, morph2, context, "if", [get(env, context, "car.is_active")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-car-list', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
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
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "partial", ["car-list-item"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "each", [get(env, context, "activeCars")], {"keyword": "car"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
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
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "partial", ["car-list-item"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "car"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","card vehicle-list white");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","card-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","card-title");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Tracked Vehicles");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","mdi-navigation-expand-less right");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","filter-selector");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("form");
        dom.setAttribute(el4,"action","#");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("label");
        dom.setAttribute(el6,"for","showOnlyActiveCars");
        var el7 = dom.createTextNode("Show Active Cars Only");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
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
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","carlist collection");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
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
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block;
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
        var element1 = dom.childAt(element0, [1, 3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [3, 1, 1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        element(env, element1, context, "action", ["toggleVehicleList"], {});
        inline(env, morph0, context, "input", [], {"type": "checkbox", "id": "showOnlyActiveCars", "checked": get(env, context, "showOnlyActiveCars")});
        block(env, morph1, context, "if", [get(env, context, "showOnlyActiveCars")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-car-selected-card', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("small");
          var el2 = dom.createTextNode("Yes");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("small");
          var el2 = dom.createTextNode("No");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","driverscore clearfix");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","score");
          var el3 = dom.createTextNode("92");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode("Current Driver Score");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2,"src","assets/img/mock_sparkline.png");
          dom.setAttribute(el2,"width","245");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
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
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","badge");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
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
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,1,1);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
          element(env, element0, context, "action", ["selectTrip", get(env, context, "trip")], {});
          inline(env, morph0, context, "pretty-Date", [get(env, context, "trip.tripEvents.firstObject.timestamp")], {});
          inline(env, morph1, context, "time-length", [get(env, context, "trip.tripEvents.firstObject.timestamp"), get(env, context, "trip.tripEvents.lastObject.timestamp")], {});
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("No trips recorded yet.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","card white car-selected");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","card-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","card-title");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","mdi-navigation-close right");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","info");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","http://placehold.it/110x100");
        dom.setAttribute(el4,"width","110");
        dom.setAttribute(el4,"height","100");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("small");
        dom.setAttribute(el5,"class","vin");
        var el6 = dom.createTextNode("VIN#");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("small");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("small");
        dom.setAttribute(el5,"class","vin");
        var el6 = dom.createTextNode("Milage");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("small");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("small");
        dom.setAttribute(el5,"class","vin");
        var el6 = dom.createTextNode("Active");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","trips");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Trips");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
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
        var hooks = env.hooks, content = hooks.content, get = hooks.get, element = hooks.element, block = hooks.block;
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
        var element1 = dom.childAt(fragment, [0, 1]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element1, [3]);
        var element5 = dom.childAt(element4, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        var morph1 = dom.createMorphAt(element5,0,0);
        var morph2 = dom.createMorphAt(element5,2,2);
        var morph3 = dom.createMorphAt(element5,4,4);
        var morph4 = dom.createMorphAt(dom.childAt(element4, [5, 3]),0,0);
        var morph5 = dom.createMorphAt(dom.childAt(element4, [7, 3]),0,0);
        var morph6 = dom.createMorphAt(dom.childAt(element4, [9]),3,3);
        var morph7 = dom.createMorphAt(element1,5,5);
        var morph8 = dom.createMorphAt(dom.childAt(element1, [7, 3]),1,1);
        content(env, morph0, context, "selectedCar.name");
        element(env, element3, context, "action", ["deselectCar", get(env, context, "selectedCar")], {});
        content(env, morph1, context, "selectedCar.vehicle.production_year");
        content(env, morph2, context, "selectedCar.vehicle.make");
        content(env, morph3, context, "selectedCar.vehicle.model");
        content(env, morph4, context, "selectedCar.vehicle.vin");
        content(env, morph5, context, "selectedCar.vehicle.mileage");
        block(env, morph6, context, "if", [get(env, context, "selectedCar.vehicle.isActive")], {}, child0, child1);
        block(env, morph7, context, "if", [get(env, context, "selectedCar.vehicle.isActive")], {}, child2, null);
        block(env, morph8, context, "each", [get(env, context, "selectedCar.vehicle.trips")], {"keyword": "trip"}, child3, child4);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-driver-list-item', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        dom.setAttribute(el1,"class","collection-item car");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        dom.setAttribute(el3,"class","vin");
        var el4 = dom.createTextNode("Driver Score: ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
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
        var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
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
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 1]),1,1);
        element(env, element0, context, "action", ["selectDriver", get(env, context, "driver")], {});
        content(env, morph0, context, "driver.name");
        content(env, morph1, context, "driver.driverScore");
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-driver-list', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
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
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "partial", ["driver-list-item"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","card vehicle-list white");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","card-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","card-title");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Drivers");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","mdi-navigation-expand-less right");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","carlist collection");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
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
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
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
        var element1 = dom.childAt(element0, [1, 3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [3]),1,1);
        element(env, element1, context, "action", ["toggleVehicleList"], {});
        block(env, morph0, context, "each", [get(env, context, "drivers")], {"keyword": "driver"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-driver-selected-card', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
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
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","badge");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                ");
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
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,1,1);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,0);
          element(env, element0, context, "action", ["selectTrip", get(env, context, "trip")], {});
          inline(env, morph0, context, "pretty-Date", [get(env, context, "trip.tripEvents.firstObject.timestamp")], {});
          inline(env, morph1, context, "time-length", [get(env, context, "trip.tripEvents.firstObject.timestamp"), get(env, context, "trip.tripEvents.lastObject.timestamp")], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("No trips recorded yet.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","card white car-selected");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","card-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","card-title");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","mdi-navigation-close right");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","driverscore clearfix");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","score");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Current Driver Score");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("img");
        dom.setAttribute(el4,"src","assets/img/mock_sparkline.png");
        dom.setAttribute(el4,"width","245");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","trips");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h4");
        var el5 = dom.createTextNode("Trips");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
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
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, block = hooks.block;
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
        var element1 = dom.childAt(fragment, [0, 1]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3, 1]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [5, 3]),1,1);
        content(env, morph0, context, "selectedDriver.name");
        element(env, element3, context, "action", ["deselectDriver"], {});
        content(env, morph1, context, "selectedDriver.driverScore");
        block(env, morph2, context, "each", [get(env, context, "selectedDriverTrips")], {"keyword": "trip"}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/-menu', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","mdi-navigation-menu");
        dom.setAttribute(el3,"title","Menu");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Connected Car");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        dom.setAttribute(el2,"class","selected");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","mdi-maps-layers");
        dom.setAttribute(el3,"title","Overview");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Overview");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        dom.setAttribute(el2,"class","");
        dom.setAttribute(el2,"id","driversMenuButton");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","mdi-action-account-child");
        dom.setAttribute(el3,"title","Drivers");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Drivers");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        dom.setAttribute(el2,"class","logout");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","mdi-navigation-close");
        dom.setAttribute(el3,"title","Sign out");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("Sign out");
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
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [5]);
        var element3 = dom.childAt(element0, [7]);
        element(env, element1, context, "action", ["toggleSideNav"], {});
        element(env, element2, context, "action", ["toggleDriverView"], {});
        element(env, element3, context, "action", ["invalidateSession"], {});
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
        revision: "Ember@1.11.0",
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
        revision: "Ember@1.11.0",
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
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","navbar navbar-inverse navbar-static-top");
        dom.setAttribute(el1,"role","navigation");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","navbar-header");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","toggleButton");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"type","button");
        dom.setAttribute(el3,"class","navbar-toggle");
        dom.setAttribute(el3,"data-toggle","collapse");
        dom.setAttribute(el3,"data-target","#navbar-collapse-01");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","sr-only");
        var el5 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","collapse navbar-collapse");
        dom.setAttribute(el2,"id","navbar-collapse-01");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","nav navbar-nav");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","nav navbar-nav navbar-right");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"style","padding-right: 10px");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        var el6 = dom.createTextNode("Sign Out");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
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
        var hooks = env.hooks, element = hooks.element, inline = hooks.inline, block = hooks.block;
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
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element2, [3]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element5, [3, 1, 1]);
        var morph0 = dom.createMorphAt(element4,0,0);
        var morph1 = dom.createMorphAt(element3,5,5);
        var morph2 = dom.createMorphAt(element6,1,1);
        var morph3 = dom.createMorphAt(element6,2,2);
        element(env, element4, context, "action", ["toggleSidebar"], {});
        inline(env, morph0, context, "fa-icon", ["fa-ellipsis-v"], {});
        inline(env, morph1, context, "link-to", ["Connected Car", "dashboard"], {"class": "navbar-brand"});
        block(env, morph2, context, "link-to", ["dashboard"], {"tagName": "li", "href": false}, child0, null);
        block(env, morph3, context, "link-to", ["settings"], {"tagName": "li", "href": false}, child1, null);
        element(env, element7, context, "action", ["invalidateSession"], {});
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
            revision: "Ember@1.11.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                            Seen: ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
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
              var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
              inline(env, morph0, context, "pretty-Date", [get(env, context, "car.gps.firstObject.timestamp")], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                            Never seen\n");
              dom.appendChild(el0, el1);
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
                revision: "Ember@1.11.0",
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
                revision: "Ember@1.11.0",
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
                  var el2 = dom.createComment("");
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
                  var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),3,3);
                  inline(env, morph0, context, "round-number", [get(env, context, "car.gps.firstObject.speed"), 0], {});
                  return fragment;
                }
              };
            }());
            var child2 = (function() {
              return {
                isHTMLBars: true,
                revision: "Ember@1.11.0",
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
                  var el2 = dom.createComment("");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createTextNode(" ");
                  dom.appendChild(el1, el2);
                  var el2 = dom.createComment("");
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
                  var morph0 = dom.createMorphAt(element0,2,2);
                  var morph1 = dom.createMorphAt(element0,4,4);
                  inline(env, morph0, context, "round-number", [get(env, context, "car.gps.firstObject.latitude"), 3], {});
                  inline(env, morph1, context, "round-number", [get(env, context, "car.gps.firstObject.longitude"), 3], {});
                  return fragment;
                }
              };
            }());
            return {
              isHTMLBars: true,
              revision: "Ember@1.11.0",
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
                var el3 = dom.createComment("");
                dom.appendChild(el2, el3);
                var el3 = dom.createComment("");
                dom.appendChild(el2, el3);
                var el3 = dom.createComment("");
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
                var morph0 = dom.createMorphAt(element2,1,1);
                var morph1 = dom.createMorphAt(element2,2,2);
                var morph2 = dom.createMorphAt(element2,3,3);
                block(env, morph0, context, "if", [get(env, context, "car.gps.firstObject.latitude")], {}, child0, null);
                block(env, morph1, context, "if", [get(env, context, "car.gps.firstObject.speed")], {}, child1, null);
                block(env, morph2, context, "if", [get(env, context, "car.gps.firstObject.latitude")], {}, child2, null);
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
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
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              block(env, morph0, context, "if", [get(env, context, "car.gps.firstObject")], {}, child0, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
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
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n                        ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("                    ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
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
            var morph0 = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
            var morph1 = dom.createMorphAt(element4,3,3);
            var morph2 = dom.createMorphAt(fragment,3,3,contextualElement);
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
        revision: "Ember@1.11.0",
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
          var el2 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "car"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","panel-menu");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","flatpanel");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","flatpanel-title");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Track Cars");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createTextNode("Internal Preview ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
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
        var element5 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element5, [1]),3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element5, [3]),1,1);
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
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/cc-spinner', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","preloader-wrapper big active");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","spinner-layer spinner-blue");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper left");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","gap-patch");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper right");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","spinner-layer spinner-red");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper left");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","gap-patch");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper right");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","spinner-layer spinner-yellow");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper left");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","gap-patch");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper right");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","spinner-layer spinner-green");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper left");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","gap-patch");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","circle-clipper right");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","circle");
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
define('oxide/templates/components/liquid-bind', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, content = hooks.content;
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "version", blockArguments[0]);
            content(env, morph0, context, "version");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "liquid-versions", [], {"value": get(env, context, "value"), "use": get(env, context, "use"), "name": "liquid-bind", "renderWhenFalse": true, "innerClass": get(env, context, "innerClass")}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, content = hooks.content;
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
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              set(env, context, "version", blockArguments[0]);
              content(env, morph0, context, "version");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "container", blockArguments[0]);
            block(env, morph0, context, "liquid-versions", [], {"value": get(env, context, "value"), "notify": get(env, context, "container"), "use": get(env, context, "use"), "name": "liquid-bind", "renderWhenFalse": true}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "liquid-container", [], {"id": get(env, context, "innerId"), "class": get(env, context, "innerClass")}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "containerless")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-container', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "yield", [get(env, context, "this")], {});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-if', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
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
              var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
              content(env, morph0, context, "yield");
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("      ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
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
              var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
              content(env, morph0, context, "lf-yield-inverse");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "valueVersion", blockArguments[0]);
            block(env, morph0, context, "if", [get(env, context, "valueVersion")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "liquid-versions", [], {"value": get(env, context, "value"), "name": get(env, context, "helperName"), "use": get(env, context, "use"), "renderWhenFalse": get(env, context, "hasInverse"), "innerClass": get(env, context, "innerClass")}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              revision: "Ember@1.11.0",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("        ");
                dom.appendChild(el0, el1);
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
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
                var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
                content(env, morph0, context, "yield");
                return fragment;
              }
            };
          }());
          var child1 = (function() {
            return {
              isHTMLBars: true,
              revision: "Ember@1.11.0",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("        ");
                dom.appendChild(el0, el1);
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
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
                var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
                content(env, morph0, context, "lf-yield-inverse");
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
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
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              set(env, context, "valueVersion", blockArguments[0]);
              block(env, morph0, context, "if", [get(env, context, "valueVersion")], {}, child0, child1);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "container", blockArguments[0]);
            block(env, morph0, context, "liquid-versions", [], {"value": get(env, context, "value"), "notify": get(env, context, "container"), "name": get(env, context, "helperName"), "use": get(env, context, "use"), "renderWhenFalse": get(env, context, "hasInverse")}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "liquid-container", [], {"id": get(env, context, "innerId"), "class": get(env, context, "innerClass")}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "containerless")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-measured', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"role","dialog");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
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
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,1,1);
            element(env, element0, context, "bind-attr", [], {"class": ":lf-dialog cc.options.dialogClass"});
            element(env, element0, context, "bind-attr", [], {"aria-labelledby": "cc.options.ariaLabelledBy", "aria-label": "cc.options.ariaLabel"});
            inline(env, morph0, context, "view", [get(env, context, "innerView")], {"dismiss": "dismiss"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, block = hooks.block, content = hooks.content;
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, 0);
          set(env, context, "cc", blockArguments[0]);
          block(env, morph0, context, "lm-container", [], {"action": "escape", "clickAway": "outsideClick"}, child0, null);
          content(env, morph1, context, "lf-overlay");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "liquid-versions", [], {"name": "liquid-modal", "value": get(env, context, "currentContext")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-outlet', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          set(env, context, "outletStateVersion", blockArguments[0]);
          inline(env, morph0, context, "lf-outlet", [], {"staticState": get(env, context, "outletStateVersion")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "liquid-with", [get(env, context, "outletState")], {"id": get(env, context, "innerId"), "class": get(env, context, "innerClass"), "use": get(env, context, "use"), "name": "liquid-outlet", "containerless": get(env, context, "containerless")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-spacer', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
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
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          content(env, morph0, context, "yield");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "liquid-measured", [], {"measurements": get(env, context, "measurements")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-versions', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
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
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              inline(env, morph0, context, "yield", [get(env, context, "version.value")], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "liquid-child", [], {"version": get(env, context, "version"), "visible": false, "didRender": "childDidRender", "class": get(env, context, "innerClass")}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          set(env, context, "version", blockArguments[0]);
          block(env, morph0, context, "if", [get(env, context, "version.shouldRender")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "each", [get(env, context, "versions")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/components/liquid-with', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "version", blockArguments[0]);
            inline(env, morph0, context, "yield", [get(env, context, "version")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "liquid-versions", [], {"value": get(env, context, "value"), "use": get(env, context, "use"), "name": get(env, context, "name"), "innerClass": get(env, context, "innerClass")}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.0",
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
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
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              set(env, context, "version", blockArguments[0]);
              inline(env, morph0, context, "yield", [get(env, context, "version")], {});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
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
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            set(env, context, "container", blockArguments[0]);
            block(env, morph0, context, "liquid-versions", [], {"value": get(env, context, "value"), "notify": get(env, context, "container"), "use": get(env, context, "use"), "name": get(env, context, "name")}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
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
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "liquid-container", [], {"id": get(env, context, "innerId"), "class": get(env, context, "innerClass")}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "containerless")], {}, child0, child1);
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
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","map");
        dom.appendChild(el0, el1);
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
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
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
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "value")});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/dashboard', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
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
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "partial", ["driver-selected-card"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block;
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
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          inline(env, morph0, context, "partial", ["driver-list"], {});
          block(env, morph1, context, "if", [get(env, context, "selectedDriver")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, inline = hooks.inline;
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
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "partial", ["car-selected-card"], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block;
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
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          inline(env, morph0, context, "partial", ["car-list"], {});
          block(env, morph1, context, "if", [get(env, context, "selectedCar")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","menu-nav");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","main-container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","content-overlay");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","cards");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","menu-flyout");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block, element = hooks.element;
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
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(fragment, [4]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [1, 1]),1,1);
        var morph2 = dom.createMorphAt(element0,3,3);
        var morph3 = dom.createMorphAt(element1,1,1);
        inline(env, morph0, context, "partial", ["menu"], {});
        block(env, morph1, context, "if", [get(env, context, "driverViewVisible")], {}, child0, child1);
        inline(env, morph2, context, "ox-map", [], {"mapReference": get(env, context, "mapReference")});
        element(env, element1, context, "action", ["toggleSideNav"], {});
        inline(env, morph3, context, "partial", ["menu"], {});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n                            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","welcome-loading");
          var el2 = dom.createTextNode("\n                                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                            ");
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
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
          element(env, element0, context, "bind-attr", [], {"class": "loading"});
          content(env, morph0, context, "cc-spinner");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","bg");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col s10 m8 offset-m2 welcome-offset");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","card card-account");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","card-image");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("img");
        dom.setAttribute(el7,"src","assets/img/loginHead.jpg");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","card-content");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","card-title grey-text text-darken-4");
        var el8 = dom.createTextNode("Connected Car Client");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("p");
        var el8 = dom.createTextNode("Please login with your Nitrogen.io account.");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","row");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("form");
        dom.setAttribute(el8,"id","login");
        var el9 = dom.createTextNode("\n                                ");
        dom.appendChild(el8, el9);
        var el9 = dom.createElement("div");
        dom.setAttribute(el9,"class","input-field col s12");
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("i");
        dom.setAttribute(el10,"class","mdi-action-bookmark-outline prefix");
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createComment("");
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("label");
        dom.setAttribute(el10,"for","identification");
        var el11 = dom.createTextNode("Username");
        dom.appendChild(el10, el11);
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                ");
        dom.appendChild(el9, el10);
        dom.appendChild(el8, el9);
        var el9 = dom.createTextNode("\n                                ");
        dom.appendChild(el8, el9);
        var el9 = dom.createElement("div");
        dom.setAttribute(el9,"class","input-field col s12");
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("i");
        dom.setAttribute(el10,"class","mdi-action-bookmark-outline prefix");
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createComment("");
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("label");
        dom.setAttribute(el10,"for","password");
        var el11 = dom.createTextNode("Password");
        dom.appendChild(el10, el11);
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                ");
        dom.appendChild(el9, el10);
        dom.appendChild(el8, el9);
        var el9 = dom.createTextNode("\n                                ");
        dom.appendChild(el8, el9);
        var el9 = dom.createElement("div");
        dom.setAttribute(el9,"class","col s12");
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("br");
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                    ");
        dom.appendChild(el9, el10);
        var el10 = dom.createElement("a");
        dom.setAttribute(el10,"class","waves-effect waves-light btn center");
        var el11 = dom.createTextNode("\n                                        ");
        dom.appendChild(el10, el11);
        var el11 = dom.createElement("i");
        dom.setAttribute(el11,"class","mdi-action-exit-to-app left");
        dom.appendChild(el10, el11);
        var el11 = dom.createTextNode("Login\n                                    ");
        dom.appendChild(el10, el11);
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode("\n                                ");
        dom.appendChild(el9, el10);
        dom.appendChild(el8, el9);
        var el9 = dom.createTextNode("\n                            ");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
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
        var hooks = env.hooks, get = hooks.get, block = hooks.block, element = hooks.element, inline = hooks.inline;
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
        var element1 = dom.childAt(fragment, [0, 1, 1, 1, 1, 3]);
        var element2 = dom.childAt(element1, [7, 1]);
        var element3 = dom.childAt(element2, [5, 3]);
        var morph0 = dom.createMorphAt(element1,1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [3]),3,3);
        block(env, morph0, context, "if", [get(env, context, "loading")], {}, child0, null);
        element(env, element2, context, "action", ["authenticate"], {"on": "submit"});
        inline(env, morph1, context, "input", [], {"class": "validate", "id": "identification", "value": get(env, context, "identification")});
        inline(env, morph2, context, "input", [], {"class": "validate", "id": "password", "type": "password", "value": get(env, context, "password")});
        element(env, element3, context, "action", ["login"], {});
        return fragment;
      }
    };
  }()));

});
define('oxide/templates/settings', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","fa fa-check-circle");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","fa fa-times-circle");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
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
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-md-12");
          var el2 = dom.createTextNode("\n                                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("pre");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
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
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),0,0);
          content(env, morph0, context, "configString");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fa fa-cogs");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" Settings");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-default");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-body");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","container-fluid");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h5");
        var el7 = dom.createTextNode("Local Storage");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-9");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createTextNode("We save information using Local Storage, a feature of your browser that allows apps to save data on the local harddrive. Since the app is still in development, things can still go wrong - and it sometimes makes sense to just delete everything and start fresh.");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-3 text-right right");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("button");
        dom.setAttribute(el8,"class","btn btn-danger");
        var el9 = dom.createTextNode("\n                            Clear Storage ");
        dom.appendChild(el8, el9);
        var el9 = dom.createElement("span");
        dom.setAttribute(el9,"class","badge");
        var el10 = dom.createComment("");
        dom.appendChild(el9, el10);
        var el10 = dom.createTextNode(" MB");
        dom.appendChild(el9, el10);
        dom.appendChild(el8, el9);
        var el9 = dom.createTextNode("\n                            ");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("hr");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h5");
        var el7 = dom.createTextNode("Nitrogen.io");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-12");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createTextNode("This app uses the open-source 'Internet of Things' Gateway Nitrogen.io to keep track of your devices.");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-2");
        var el8 = dom.createElement("strong");
        var el9 = dom.createTextNode("Secure:");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode(" \n");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-2");
        var el8 = dom.createElement("strong");
        var el9 = dom.createTextNode("Host:");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode(" ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-2");
        var el8 = dom.createElement("strong");
        var el9 = dom.createTextNode("Protocol:");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode(" ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-2");
        var el8 = dom.createElement("strong");
        var el9 = dom.createTextNode("Port:");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode(" ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-4");
        var el8 = dom.createElement("strong");
        var el9 = dom.createTextNode("Base:");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode(" ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("hr");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h5");
        var el7 = dom.createTextNode("Environment Configuration");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-9");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createTextNode("This is the full configuration. Unless you're trying to fix something, you probably don't want to see this.");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","col-md-3 text-right right");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("button");
        dom.setAttribute(el8,"class","btn btn-default");
        var el9 = dom.createTextNode("\n                            Show ENV Config\n                            ");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
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
        var hooks = env.hooks, inline = hooks.inline, element = hooks.element, content = hooks.content, get = hooks.get, block = hooks.block;
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
        var element0 = dom.childAt(fragment, [2, 3, 1, 1, 1]);
        var element1 = dom.childAt(element0, [3, 3, 1]);
        var element2 = dom.childAt(element0, [9]);
        var element3 = dom.childAt(element0, [15]);
        var element4 = dom.childAt(element3, [3, 1]);
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [1]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [3]),2,2);
        var morph3 = dom.createMorphAt(dom.childAt(element2, [5]),2,2);
        var morph4 = dom.createMorphAt(dom.childAt(element2, [7]),2,2);
        var morph5 = dom.createMorphAt(dom.childAt(element2, [9]),2,2);
        var morph6 = dom.createMorphAt(dom.childAt(element2, [11]),2,2);
        var morph7 = dom.createMorphAt(element3,5,5);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "partial", ["navbar"], {});
        element(env, element1, context, "action", ["clearLocalStorage"], {});
        content(env, morph1, context, "localStorageSize");
        block(env, morph2, context, "if", [get(env, context, "connectionSecure")], {}, child0, child1);
        content(env, morph3, context, "config.nitrogen.host");
        content(env, morph4, context, "config.nitrogen.protocol");
        content(env, morph5, context, "config.nitrogen.http_port");
        content(env, morph6, context, "config.nitrogen.base_url");
        element(env, element4, context, "action", ["toggleShowConfig"], {"target": get(env, context, "view")});
        block(env, morph7, context, "if", [get(env, context, "view.showConfigString")], {}, child2, null);
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
define('oxide/tests/adapters/device.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/device.js should pass jshint', function() { 
    ok(true, 'adapters/device.js should pass jshint.'); 
  });

});
define('oxide/tests/adapters/user.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/user.js should pass jshint', function() { 
    ok(true, 'adapters/user.js should pass jshint.'); 
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
define('oxide/tests/components/cc-spinner.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/cc-spinner.js should pass jshint', function() { 
    ok(true, 'components/cc-spinner.js should pass jshint.'); 
  });

});
define('oxide/tests/components/ox-map.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/ox-map.js should pass jshint', function() { 
    ok(true, 'components/ox-map.js should pass jshint.'); 
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
define('oxide/tests/helpers/ajax-mock', function () {

    'use strict';

    $.mockjax({
        url: "http://localhost:3000/vehicles/*/trips",
        responseText: {
            data: [{
                id: "acf3ba91-8ee0-4b64-814a-52df6bdad442",
                type: "trip",
                trip_events: [{
                    id: "553ac599cb49af5c772f9983",
                    event_type: "direction_change",
                    type: "event",
                    timestamp: "2014-06-27T03:28:35 +07:00",
                    speed: 8,
                    location: {
                        id: "13412",
                        latitude: 56.649237,
                        longitude: 136.74491,
                        direction: 51,
                        altitude: 681
                    }
                }, {
                    id: "553ac599685144ba00e7f8cd",
                    event_type: "engine_stop",
                    type: "event",
                    timestamp: "2014-05-22T07:05:24 +07:00",
                    speed: 3,
                    location: {
                        id: "13413",
                        latitude: -21.687184,
                        longitude: -77.175881,
                        direction: 158,
                        altitude: 9
                    }
                }],
                links: {
                    self: "http://localhost:3000/vehicles/553ac59934dff597a9708c71/trip/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                    driver: {
                        related: "http://localhost:3000/drivers/acf3ba91-8ee0-4b64-814a-52df6bdad442"
                    }
                }
            }]
        }
    });

    $.mockjax({
        url: "http://localhost:3000/vehicles/553ac59934dff597a9708c71",
        responseText: {
            data: [{
                type: "vehicle",
                name: "553ac59934dff597a9708c71",
                id: "553ac59934dff597a9708c71",
                is_active: true,
                vin: "553ac59993884615b15b93d3",
                make: "Toyota",
                model: "Prius",
                production_year: 2013,
                mileage: "4,884.3",
                links: {
                    self: "http://localhost:3000/vehicles/553ac59934dff597a9708c71",
                    trips: {
                        related: "http://localhost:3000/trips/553ac59934dff597a9708c71",
                        linkage: [{
                            type: "trip",
                            id: "acf3ba91-8ee0-4b64-814a-52df6bdad442"
                        }, {
                            type: "trip",
                            id: "acf3ba91-8ee0-4b64-814a-52df6bdad443"
                        }]
                    }
                }
            }],
            included: [{
                id: "acf3ba91-8ee0-4b64-814a-52df6bdad442",
                type: "trip",
                trip_events: [{
                    id: "553ac599cb49af5c772f9983",
                    event_type: "direction_change",
                    type: "event",
                    timestamp: "2014-06-27T03:28:35 +07:00",
                    speed: 8,
                    location: {
                        id: "13412",
                        latitude: 56.649237,
                        longitude: 136.74491,
                        direction: 51,
                        altitude: 681
                    }
                }, {
                    id: "553ac599685144ba00e7f8cd",
                    event_type: "engine_stop",
                    type: "event",
                    timestamp: "2014-05-22T07:05:24 +07:00",
                    speed: 3,
                    location: {
                        id: "13413",
                        latitude: -21.687184,
                        longitude: -77.175881,
                        direction: 158,
                        altitude: 9
                    }
                }],
                links: {
                    self: "http://localhost:3000/vehicles/553ac59934dff597a9708c71/trip/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                    driver: {
                        related: "http://localhost:3000/drivers/acf3ba91-8ee0-4b64-814a-52df6bdad442"
                    }
                }
            }, {
                id: "acf3ba91-8ee0-4b64-814a-52df6bdad443",
                type: "trip",
                trip_events: [{
                    id: "553ac599cb49af5c772f9982",
                    event_type: "direction_change",
                    timestamp: "2014-06-27T03:28:35 +07:00",
                    speed: 8,
                    location: {
                        id: "13414",
                        latitude: 56.649237,
                        longitude: 136.74491,
                        direction: 51,
                        altitude: 681
                    }
                }, {
                    id: "553ac599685144ba00e7f8cb",
                    event_type: "engine_stop",
                    timestamp: "2014-05-22T07:05:24 +07:00",
                    speed: 3,
                    location: {
                        id: "13415",
                        latitude: -21.687184,
                        longitude: -77.175881,
                        direction: 158,
                        altitude: 9
                    }
                }],
                links: {
                    self: "http://localhost:3000/trips/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                    driver: {
                        related: "http://localhost:3000/drivers/553ac59965094b476a817fa6"
                    }
                }
            }]
        }
    });

    $.mockjax({
        url: "http://localhost:3000/vehicles",
        responseText: {
            data: [{
                id: "553ac59934dff597a9708c71",
                is_active: true,
                links: {
                    self: "http://localhost:3000/vehicles/553ac59934dff597a9708c71",
                    trips: {
                        related: "http://localhost:3000/trips/553ac59934dff597a9708c71"
                    }
                },
                make: "Toyota",
                mileage: "4,884.3",
                model: "Prius",
                name: "553ac59934dff597a9708c71",
                production_year: 2013,
                type: "vehicle",
                vin: "553ac59993884615b15b93d3"
            }]
        }
    });

    $.mockjax({
        url: "http://localhost:3000/drivers/*",
        responseText: {
            data: [{
                id: "553ac59965094b476a817fa6",
                type: "driver",
                name: "Wilcox, Fitzgerald"
            }]
        }
    });

    $.mockjax({
        url: "http://localhost:3000/drivers",
        responseText: {
            data: [{
                id: "553ac59965094b476a817fa6",
                type: "driver",
                name: "Wilcox, Fitzgerald"
            }]
        }
    });
    $.mockjax({
        url: "http://localhost:3000/trips/*/driver",
        responseText: {
            data: [{
                id: "553ac59965094b476a817fa6",
                type: "driver",
                name: "Wilcox, Fitzgerald"
            }]
        }
    });

    $.mockjax({
        url: "http://localhost:3000/trips/*",
        responseText: {
            data: [{
                id: "acf3ba91-8ee0-4b64-814a-52df6bdad442",
                type: "trip",
                trip_events: [{
                    id: "553ac599cb49af5c772f9983",
                    event_type: "direction_change",
                    type: "event",
                    timestamp: "2014-06-27T03:28:35 +07:00",
                    speed: 8,
                    location: {
                        id: "13412",
                        latitude: 56.649237,
                        longitude: 136.74491,
                        direction: 51,
                        altitude: 681
                    }
                }, {
                    id: "553ac599685144ba00e7f8cd",
                    event_type: "engine_stop",
                    type: "event",
                    timestamp: "2014-05-22T07:05:24 +07:00",
                    speed: 3,
                    location: {
                        id: "13413",
                        latitude: -21.687184,
                        longitude: -77.175881,
                        direction: 158,
                        altitude: 9
                    }
                }],
                links: {
                    self: "http://localhost:3000/vehicles/553ac59934dff597a9708c71/trip/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                    driver: {
                        related: "http://localhost:3000/drivers/acf3ba91-8ee0-4b64-814a-52df6bdad442"
                    }
                }
            }]
        }
    });

});
define('oxide/tests/helpers/ajax-mock.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/ajax-mock.js should pass jshint', function() { 
    ok(true, 'helpers/ajax-mock.js should pass jshint.'); 
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
  console.dir(resolver.namespace);
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
define('oxide/tests/helpers/start-app', ['exports', 'ember', 'oxide/app', 'oxide/config/environment', 'oxide/tests/helpers/ajax-mock'], function (exports, Ember, Application, config) {

    'use strict';



    exports['default'] = startApp;
    function startApp(attrs, assert) {
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
define('oxide/tests/helpers/time-length.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/time-length.js should pass jshint', function() { 
    ok(true, 'helpers/time-length.js should pass jshint.'); 
  });

});
define('oxide/tests/initializers/nitrogen.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/nitrogen.js should pass jshint', function() { 
    ok(true, 'initializers/nitrogen.js should pass jshint.'); 
  });

});
define('oxide/tests/models/device.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/device.js should pass jshint', function() { 
    ok(true, 'models/device.js should pass jshint.'); 
  });

});
define('oxide/tests/models/driver.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/driver.js should pass jshint', function() { 
    ok(true, 'models/driver.js should pass jshint.'); 
  });

});
define('oxide/tests/models/event.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/event.js should pass jshint', function() { 
    ok(true, 'models/event.js should pass jshint.'); 
  });

});
define('oxide/tests/models/location.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/location.js should pass jshint', function() { 
    ok(true, 'models/location.js should pass jshint.'); 
  });

});
define('oxide/tests/models/trip.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/trip.js should pass jshint', function() { 
    ok(true, 'models/trip.js should pass jshint.'); 
  });

});
define('oxide/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('oxide/tests/models/vehicle.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/vehicle.js should pass jshint', function() { 
    ok(true, 'models/vehicle.js should pass jshint.'); 
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
define('oxide/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('oxide/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('oxide/tests/serializers/device.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/device.js should pass jshint', function() { 
    ok(true, 'serializers/device.js should pass jshint.'); 
  });

});
define('oxide/tests/serializers/user.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/user.js should pass jshint', function() { 
    ok(true, 'serializers/user.js should pass jshint.'); 
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
define('oxide/tests/transitions.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('transitions.js should pass jshint', function() { 
    ok(true, 'transitions.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/adapters/device-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:device", "DeviceAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('oxide/tests/unit/adapters/device-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/device-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/device-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/adapters/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:user", "UserAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('oxide/tests/unit/adapters/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/user-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/user-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/components/cc-spinner-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("cc-spinner", {});

  ember_qunit.test("it renders", function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, "preRender");

    // Renders the component to the page
    this.render();
    assert.equal(component._state, "inDOM");
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('oxide/tests/unit/components/cc-spinner-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/cc-spinner-test.js should pass jshint', function() { 
    ok(true, 'unit/components/cc-spinner-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controller/dashboard-test', ['ember', 'ember-qunit', 'oxide/tests/helpers/start-app', 'oxide/utils/nitrogen-ember-utils'], function (Ember, ember_qunit, startApp, nitrogenEmberUtils) {

    'use strict';

    var App, store, session, principal, user, MockMap;

    ember_qunit.moduleFor("controller:dashboard", {
        needs: ["controller:nitrogen", "controller:application"],

        setup: function setup() {
            App = startApp['default'](null);
            store = App.__container__.lookup("store:main");
            session = App.__container__.lookup("simple-auth-session:main");
            var nitroService = new window.nitrogen.Service();

            // bing maps mock
            MockMap = function (assert) {
                // to ensure api conformance from our code to maps api
                this.assert = assert;
                this.options = {};
            };

            MockMap.prototype = {
                getOptions: function getOptions() {
                    return this.options;
                },

                setView: function setView(options) {
                    this.assert.ok(typeof options === "object");
                    this.assert.ok(typeof options.center.latitude === "number");
                    this.assert.ok(typeof options.center.longitude === "number");
                    this.assert.ok(typeof options.zoom === "number");
                },

                entities: {
                    list: [],
                    getLength: function getLength() {
                        return 1;
                    },
                    push: function push(pin) {
                        this.list.push(pin);
                    },
                    insert: function insert() {
                        return true;
                    }
                }
            };

            nitroService.authenticate(null, function (err, nitroSession, user) {
                principal = nitroSession.principal;
                user = user;
                session.set("principal", principal);

                Ember['default'].run(function () {
                    user = store.createRecord("user", user);
                    user.save();

                    nitrogenEmberUtils['default'].newDevice(store, principal);
                });
            });
        },

        teardown: function teardown() {
            Ember['default'].run(App, App.destroy);
            window.localStorage.clear();
            store = null;
        }

    });

    ember_qunit.test("it should track all cars", function (assert) {
        // insert assetation library to confirm we call api correctly
        assert.expect(9);
        window.nitrogen.assert = assert;
        window.Microsoft.assert = assert;

        var self = this;
        var trackAllCars = App.__container__.lookup("controller:dashboard").trackAllCars;
        var loginController = App.__container__.lookup("controller:dashboard");

        Ember['default'].run(function () {
            var controller = self.subject({
                trackAllCars: (function () {
                    var _this = this;

                    assert.ok(true);

                    this.store = store;
                    this.set("trackAllCars", trackAllCars);

                    // observe track car mapping
                    this.addObserver("trackedCars", controller, function () {
                        // ensure all cars tracked
                        assert.ok(_this.get("trackedCars").length === 1);
                        store.find("device").then(function (devices) {
                            devices.forEach(function (device) {
                                assert.ok(device.get("trackOnMap"));
                            });
                        });
                    });
                    this.trackAllCars();
                }).on("init")
            });
        });
    });

    ember_qunit.test("it should toggle all cars", function (assert) {
        // insert assetation library to confirm we call api correctly
        assert.expect(10);
        window.nitrogen.assert = assert;
        window.Microsoft.assert = assert;

        var self = this;
        var trackAllCars = App.__container__.lookup("controller:dashboard").trackAllCars;
        var loginController = App.__container__.lookup("controller:dashboard");

        Ember['default'].run(function () {
            self.subject({
                trackAllCars: (function () {
                    var _this = this;

                    // test trackAllCars called on init.
                    assert.ok(true);
                    var controller = this;
                    controller.store = store;
                    controller.set("trackAllCars", trackAllCars);

                    Ember['default'].run(function () {
                        // add test observer to test if cars are actually add/removed
                        _this.addObserver("trackedCars", controller, function () {
                            // ensure all cars tracked
                            assert.ok(_this.get("trackedCars").length === 1);
                            store.find("device").then(function (devices) {
                                devices.forEach(function (device) {
                                    controller.send("toggleCar", device);
                                    assert.ok(device.get("trackOnMap") === false);
                                });
                                assert.ok(controller.get("trackedCars").length === 0);
                            });
                        });

                        // call the actual implementation
                        controller.trackAllCars();
                    });
                }).on("init")
            });
        });
    });

    ember_qunit.test("it should update car location when it receives a socket message", function (assert) {
        // insert assetation library to confirm we call api correctly
        assert.expect(9);
        window.nitrogen.assert = assert;
        window.Microsoft.assert = assert;

        var self = this;
        var trackAllCars = App.__container__.lookup("controller:dashboard").trackAllCars;
        var loginController = App.__container__.lookup("controller:dashboard");

        Ember['default'].run(function () {
            self.subject({
                trackAllCars: (function () {
                    // test trackAllCars called on init.
                    assert.ok(true);

                    var controller = this;
                    controller.store = store;
                    controller.set("trackAllCars", trackAllCars);

                    Ember['default'].run(function () {
                        store.find("device").then(function (devices) {
                            devices.forEach(function (device) {
                                // this id is hard coded into the nitrogen mock
                                var mockMessage = {
                                    from: "abc-123",
                                    body: {
                                        timestamp: new Date(Date.now() - 3000),
                                        // tenderloin SF area...
                                        latitude: 37.783343 + Math.random(),
                                        longitude: -122.413207 + Math.random(),
                                        // km/hr? mi/hr?
                                        speed: "25.3"
                                    }
                                };

                                // call the actual implementation
                                controller.trackAllCars();
                                Ember['default'].run(function () {
                                    controller.send("handleSocketMessage", mockMessage, "updateCar");
                                    controller.addObserver("trackedCars", controller, function () {

                                        Ember['default'].run(function () {
                                            store.find("device", {
                                                nitrogen_id: "abc-123"
                                            }).then(function (devices) {
                                                assert.ok(devices.content[0].get("gps")[0].longitude === mockMessage.body.longitude);
                                                assert.ok(devices.content[0].get("gps")[0].latitiude === mockMessage.body.latitiude);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }).on("init")
            });
        });
    });

    ember_qunit.test("it should center the map", function (assert) {
        // insert assetation library to confirm we call api correctly
        assert.expect(13);
        window.nitrogen.assert = assert;
        window.Microsoft.assert = assert;

        var self = this;
        var trackAllCars = App.__container__.lookup("controller:dashboard").trackAllCars;
        var loginController = App.__container__.lookup("controller:dashboard");

        Ember['default'].run(function () {
            self.subject({
                trackAllCars: (function () {
                    // test trackAllCars called on init.
                    assert.ok(true);
                    var controller = this;
                    controller.store = store;
                    controller.set("trackAllCars", trackAllCars);

                    Ember['default'].run(function () {
                        var testLat = 37.783343 + Math.random();
                        var testLon = -122.413207 + Math.random();
                        // insert a fake map for the controller
                        var mockMapRef = new MockMap(assert);
                        controller.set("mapReference", mockMapRef);
                        controller.send("centerMap", {
                            latitude: testLat,
                            longitude: testLon
                        });
                        // should have set lat and lon accordingly
                        assert.ok(mockMapRef.getOptions().center.latitude === testLat);
                        assert.ok(mockMapRef.getOptions().center.longitude === testLon);
                    });
                }).on("init")
            });
        });
    });

    ember_qunit.test("it should center on car", function (assert) {
        // insert assetation library to confirm we call api correctly
        assert.expect(13);
        window.nitrogen.assert = assert;
        window.Microsoft.assert = assert;

        var self = this;
        var trackAllCars = App.__container__.lookup("controller:dashboard").trackAllCars;
        var loginController = App.__container__.lookup("controller:dashboard");

        Ember['default'].run(function () {
            self.subject({
                trackAllCars: (function () {
                    // test trackAllCars called on init.
                    assert.ok(true);
                    var controller = this;
                    controller.store = store;
                    controller.set("trackAllCars", trackAllCars);

                    Ember['default'].run(function () {
                        // call the actual implementation
                        controller.trackAllCars();
                        // insert a fake map for the controller
                        var mockMapRef = new MockMap(assert);
                        controller.set("mapReference", mockMapRef);

                        store.find("device", {
                            nitrogen_id: "abc-123"
                        }).then(function (devices) {
                            var gps = devices.content[0].get("gps");

                            var firstLoc = {
                                latitude: 37.783343 + Math.random(),
                                longitude: -122.413207 + Math.random()
                            };

                            var secondLoc = {
                                latitude: 37.783343 + Math.random(),
                                longitude: -122.413207 + Math.random()
                            };

                            gps.pushObject(firstLoc);
                            gps.pushObject(secondLoc);

                            controller.send("centerOnCar", devices.content[0]);

                            // should have set lat and lon accordingly
                            assert.ok(mockMapRef.getOptions().center.latitude === secondLoc.latitude);
                            assert.ok(mockMapRef.getOptions().center.longitude === secondLoc.longitude);
                        });
                    });
                }).on("init")
            });
        });
    });

    ember_qunit.test("it should add a car to map", function (assert) {
        // insert assetation library to confirm we call api correctly
        assert.expect(17);
        // add asserts to our mock apis
        window.nitrogen.assert = assert;
        window.Microsoft.assert = assert;

        var self = this;
        var trackAllCars = App.__container__.lookup("controller:dashboard").trackAllCars;
        var loginController = App.__container__.lookup("controller:dashboard");

        Ember['default'].run(function () {
            self.subject({
                trackAllCars: (function () {
                    // test trackAllCars called on init.
                    assert.ok(true);
                    var controller = this;
                    controller.store = store;
                    controller.set("trackAllCars", trackAllCars);

                    Ember['default'].run(function () {
                        // call the actual implementation
                        controller.trackAllCars();
                        // insert a fake map for the controller
                        var mockMapRef = new MockMap(assert);
                        controller.set("mapReference", mockMapRef);

                        store.find("device", {
                            nitrogen_id: "abc-123"
                        }).then(function (devices) {
                            var gps = devices.content[0].get("gps");
                            var firstLoc = {
                                latitude: 37.783343 + Math.random(),
                                longitude: -122.413207 + Math.random()
                            };
                            var secondLoc = {
                                latitude: 37.783343 + Math.random(),
                                longitude: -122.413207 + Math.random()
                            };
                            gps.push(firstLoc);
                            gps.push(secondLoc);
                            controller.send("addCarToMap", devices.content[0]);
                        });
                    });
                }).on("init")
            });
        });
    });

});
define('oxide/tests/unit/controller/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controller');
  test('unit/controller/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/controller/dashboard-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/controller/login-test', ['ember', 'ember-qunit', 'oxide/tests/helpers/start-app'], function (Ember, ember_qunit, startApp) {

  'use strict';

  var App, store, session;

  ember_qunit.moduleFor("controller:login", {
    needs: ["controller:application"],

    setup: function setup() {
      App = startApp['default'](null);
      store = App.__container__.lookup("store:main");
      session = App.__container__.lookup("simple-auth-session:main");
    },
    teardown: function teardown() {
      Ember['default'].run(App, App.destroy);
      window.localStorage.clear();
      store = null;
    }

  });

  ember_qunit.test("it should login and toggle the loading state", function (assert) {
    // insert assetation library to confirm we call api correctly
    window.nitrogen.assert = assert;
    assert.expect(6);
    var controller = this.subject();
    controller.store = store;
    var loggingIn = false;
    controller.addObserver("loading", controller, function () {
      if (!loggingIn) {
        assert.ok(controller.get("loading"));
        loggingIn = true;
      } else {
        assert.ok(controller.get("loading") === false);
      }
    });
    Ember['default'].run(function () {
      controller.set("identification", "testuser");
      controller.set("password", "testpassword");
      assert.ok(controller.get("loading") === false);
      controller.set("session", session);
      controller.send("authenticate");
    });
  });

});
define('oxide/tests/unit/controller/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controller');
  test('unit/controller/login-test.js should pass jshint', function() { 
    ok(true, 'unit/controller/login-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/helpers/time-length-test', ['oxide/helpers/time-length', 'qunit'], function (time_length, qunit) {

    'use strict';

    qunit.module("TimeLengthHelper");

    // Replace this with your real tests.
    qunit.test("it works", function (assert) {
        var result = time_length.timeLength(["2015-05-26T17:06:14.407Z", "2015-05-25T17:06:14.407Z"]);

        assert.equal(result, "a day");
    });

});
define('oxide/tests/unit/helpers/time-length-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/time-length-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/time-length-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/driver-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("driver", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();

    // var store = this.store();
    assert.ok(!!model);
  });

});
define('oxide/tests/unit/models/driver-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/driver-test.js should pass jshint', function() { 
    ok(true, 'unit/models/driver-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/event-test', function () {

	'use strict';

	// import {
	//   moduleForModel,
	//   test
	// } from 'ember-qunit';

	// moduleForModel('event', {
	//   // Specify the other units that are required for this test.
	//   needs: []
	// });

	// test('it exists', function(assert) {
	//   var model = this.subject();
	//   // var store = this.store();
	//   assert.ok(!!model);
	// });

});
define('oxide/tests/unit/models/event-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/event-test.js should pass jshint', function() { 
    ok(true, 'unit/models/event-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/location-test', function () {

	'use strict';

	// import {
	//   moduleForModel,
	//   test
	// } from 'ember-qunit';

	// moduleForModel('location', {
	//   // Specify the other units that are required for this test.
	//   needs: []
	// });

	// test('it exists', function(assert) {
	//   var model = this.subject();
	//   // var store = this.store();
	//   assert.ok(!!model);
	// });

});
define('oxide/tests/unit/models/location-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/location-test.js should pass jshint', function() { 
    ok(true, 'unit/models/location-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/models/vehicle-test', ['ember', 'ember-qunit', 'oxide/tests/helpers/start-app'], function (Ember, ember_qunit, startApp) {

  'use strict';

  /* global start */
  /* global stop */
  var App, store, session;

  ember_qunit.moduleFor("model:vehicle", {
    needs: ["model:driver", "model:trip", "model:event"],

    setup: function setup() {
      App = startApp['default'](null);
      store = App.__container__.lookup("store:main");
      session = App.__container__.lookup("simple-auth-session:main");
    },
    teardown: function teardown() {
      Ember['default'].run(App, App.destroy);
      window.localStorage.clear();
      store = null;
    }

  });
  ember_qunit.test("it returns all vehicles", function (assert) {
    assert.expect(3);

    Ember['default'].run(function () {
      stop();
      store.find("vehicle").then(function (vehicles) {
        vehicles.forEach(function (vehicle) {
          assert.ok(vehicle);
          vehicle.get("trips").then(function (trips) {
            trips.forEach(function (trip) {
              assert.ok(trip);
              trip.get("driver").then(function (driver) {
                assert.ok(typeof driver.get("name") === "string");
                start();
              }, function (err) {
                console.log(err.stack);
                start();
              });
            });
          }, function (err) {
            console.error(err.stack);
            start();
          });
        }, function (err) {
          console.error(err.stack);
          start();
        });
      });
    });
  });

  ember_qunit.test("it returns vehicle with specified id", function (assert) {
    assert.expect(29);
    Ember['default'].run(function () {

      stop();
      store.find("vehicle", "553ac59934dff597a9708c71").then(function (vehicle) {
        assert.ok(vehicle);
        vehicle.get("trips").forEach(function (trip) {
          trip.get("tripEvents").then(function (events) {
            events.forEach(function (event) {
              assert.ok(event.get("eventType") && typeof event.get("eventType") === "string");
              assert.ok(event.get("timestamp") && typeof event.get("timestamp") === "string");
              assert.ok(event.get("speed") && typeof event.get("speed") === "number");
              assert.ok(typeof event.get("location") === "object");
              assert.ok(typeof event.get("trip") === "object");
              assert.ok(event.get("location").get("latitude") && typeof event.get("location").get("latitude") === "number");
              assert.ok(event.get("location").get("longitude") && typeof event.get("location").get("longitude") === "number");
            });
          });
        });
        start();
      });
    });
  });

});
define('oxide/tests/unit/models/vehicle-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/vehicle-test.js should pass jshint', function() { 
    ok(true, 'unit/models/vehicle-test.js should pass jshint.'); 
  });

});
define('oxide/tests/unit/views/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:application");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('oxide/tests/unit/views/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/application-test.js should pass jshint', function() { 
    ok(true, 'unit/views/application-test.js should pass jshint.'); 
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
define('oxide/tests/views/settings.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/settings.js should pass jshint', function() { 
    ok(true, 'views/settings.js should pass jshint.'); 
  });

});
define('oxide/transforms/array', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

    'use strict';

    exports['default'] = DS['default'].Transform.extend({
        deserialize: function deserialize(value) {
            if (Ember['default'].isArray(value)) {
                return Ember['default'].A(value);
            } else {
                return Ember['default'].A();
            }
        },
        serialize: function serialize(value) {
            if (Ember['default'].isArray(value)) {
                return Ember['default'].A(value);
            } else {
                return Ember['default'].A();
            }
        }
    });

});
define('oxide/transitions', ['exports'], function (exports) {

    'use strict';

    var transition = function transition() {
        this.transition(this.fromRoute("login"), this.toRoute("dashboard"), this.use("toLeft"), this.reverse("toRight"));
    };

    exports['default'] = transition;

});
define('oxide/transitions/cross-fade', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = crossFade;
  // BEGIN-SNIPPET cross-fade-definition
  function crossFade() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    liquid_fire.stop(this.oldElement);
    return liquid_fire.Promise.all([liquid_fire.animate(this.oldElement, { opacity: 0 }, opts), liquid_fire.animate(this.newElement, { opacity: [opts.maxOpacity || 1, 0] }, opts)]);
  } // END-SNIPPET

});
define('oxide/transitions/default', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  // This is what we run when no animation is asked for. It just sets
  // the newly-added element to visible (because we always start them
  // out invisible so that transitions can control their initial
  // appearance).
  exports['default'] = defaultTransition;
  function defaultTransition() {
    if (this.newElement) {
      this.newElement.css({ visibility: "" });
    }
    return liquid_fire.Promise.resolve();
  }

});
define('oxide/transitions/explode', ['exports', 'ember', 'liquid-fire'], function (exports, Ember, liquid_fire) {

  'use strict';



  // Explode is not, by itself, an animation. It exists to pull apart
  // other elements so that each of the pieces can be targeted by
  // animations.

  exports['default'] = explode;

  function explode() {
    var _this = this;

    for (var _len = arguments.length, pieces = Array(_len), _key = 0; _key < _len; _key++) {
      pieces[_key] = arguments[_key];
    }

    var sawBackgroundPiece = false;
    var promises = pieces.map(function (piece) {
      if (piece.matchBy) {
        return matchAndExplode(_this, piece);
      } else if (piece.pick || piece.pickOld || piece.pickNew) {
        return explodePiece(_this, piece);
      } else {
        sawBackgroundPiece = true;
        return runAnimation(_this, piece);
      }
    });
    if (!sawBackgroundPiece) {
      if (this.newElement) {
        this.newElement.css({ visibility: "" });
      }
      if (this.oldElement) {
        this.oldElement.css({ visibility: "hidden" });
      }
    }
    return liquid_fire.Promise.all(promises);
  }

  function explodePiece(context, piece) {
    var childContext = Ember['default'].copy(context);
    var selectors = [piece.pickOld || piece.pick, piece.pickNew || piece.pick];
    var cleanupOld, cleanupNew;

    if (selectors[0] || selectors[1]) {
      cleanupOld = _explodePart(context, "oldElement", childContext, selectors[0]);
      cleanupNew = _explodePart(context, "newElement", childContext, selectors[1]);
      if (!cleanupOld && !cleanupNew) {
        return liquid_fire.Promise.resolve();
      }
    }

    return runAnimation(childContext, piece)["finally"](function () {
      if (cleanupOld) {
        cleanupOld();
      }
      if (cleanupNew) {
        cleanupNew();
      }
    });
  }

  function _explodePart(context, field, childContext, selector) {
    var child, childOffset, width, height, newChild;
    var elt = context[field];
    childContext[field] = null;
    if (elt && selector) {
      child = elt.find(selector);
      if (child.length > 0) {
        childOffset = child.offset();
        width = child.outerWidth();
        height = child.outerHeight();
        newChild = child.clone();

        // Hide the original element
        child.css({ visibility: "hidden" });

        // If the original element's parent was hidden, hide our clone
        // too.
        if (elt.css("visibility") === "hidden") {
          newChild.css({ visibility: "hidden" });
        }
        newChild.appendTo(elt.parent());
        newChild.outerWidth(width);
        newChild.outerHeight(height);
        var newParentOffset = newChild.offsetParent().offset();
        newChild.css({
          position: "absolute",
          top: childOffset.top - newParentOffset.top,
          left: childOffset.left - newParentOffset.left,
          margin: 0
        });

        // Pass the clone to the next animation
        childContext[field] = newChild;
        return function cleanup() {
          newChild.remove();
          child.css({ visibility: "" });
        };
      }
    }
  }

  function animationFor(context, piece) {
    var name, args, func;
    if (!piece.use) {
      throw new Error("every argument to the 'explode' animation must include a followup animation to 'use'");
    }
    if (Ember['default'].isArray(piece.use)) {
      name = piece.use[0];
      args = piece.use.slice(1);
    } else {
      name = piece.use;
      args = [];
    }
    if (typeof name === "function") {
      func = name;
    } else {
      func = context.lookup(name);
    }
    return function () {
      return liquid_fire.Promise.resolve(func.apply(this, args));
    };
  }

  function runAnimation(context, piece) {
    return new liquid_fire.Promise(function (resolve, reject) {
      animationFor(context, piece).apply(context).then(resolve, reject);
    });
  }

  function matchAndExplode(context, piece) {
    if (!context.oldElement) {
      return liquid_fire.Promise.resolve();
    }

    var hits = Ember['default'].A(context.oldElement.find("[" + piece.matchBy + "]").toArray());
    return liquid_fire.Promise.all(hits.map(function (elt) {
      return explodePiece(context, {
        pick: "[" + piece.matchBy + "=" + Ember['default'].$(elt).attr(piece.matchBy) + "]",
        use: piece.use
      });
    }));
  }

});
define('oxide/transitions/fade', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = fade;

  // BEGIN-SNIPPET fade-definition
  function fade() {
    var _this = this;

    var opts = arguments[0] === undefined ? {} : arguments[0];

    var firstStep;
    var outOpts = opts;
    var fadingElement = findFadingElement(this);

    if (fadingElement) {
      // We still have some older version that is in the process of
      // fading out, so out first step is waiting for it to finish.
      firstStep = liquid_fire.finish(fadingElement, "fade-out");
    } else {
      if (liquid_fire.isAnimating(this.oldElement, "fade-in")) {
        // if the previous view is partially faded in, scale its
        // fade-out duration appropriately.
        outOpts = { duration: liquid_fire.timeSpent(this.oldElement, "fade-in") };
      }
      liquid_fire.stop(this.oldElement);
      firstStep = liquid_fire.animate(this.oldElement, { opacity: 0 }, outOpts, "fade-out");
    }
    return firstStep.then(function () {
      return liquid_fire.animate(_this.newElement, { opacity: [opts.maxOpacity || 1, 0] }, opts, "fade-in");
    });
  }

  function findFadingElement(context) {
    for (var i = 0; i < context.older.length; i++) {
      var entry = context.older[i];
      if (liquid_fire.isAnimating(entry.element, "fade-out")) {
        return entry.element;
      }
    }
    if (liquid_fire.isAnimating(context.oldElement, "fade-out")) {
      return context.oldElement;
    }
  }
  // END-SNIPPET

});
define('oxide/transitions/flex-grow', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';


  exports['default'] = flexGrow;
  function flexGrow(opts) {
    liquid_fire.stop(this.oldElement);
    return liquid_fire.Promise.all([liquid_fire.animate(this.oldElement, { "flex-grow": 0 }, opts), liquid_fire.animate(this.newElement, { "flex-grow": [1, 0] }, opts)]);
  }

});
define('oxide/transitions/fly-to', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  exports['default'] = flyTo;
  function flyTo() {
    var _this = this;

    var opts = arguments[0] === undefined ? {} : arguments[0];

    if (!this.newElement) {
      return liquid_fire.Promise.resolve();
    } else if (!this.oldElement) {
      this.newElement.css({ visibility: "" });
      return liquid_fire.Promise.resolve();
    }

    var oldOffset = this.oldElement.offset();
    var newOffset = this.newElement.offset();

    var motion = {
      translateX: newOffset.left - oldOffset.left,
      translateY: newOffset.top - oldOffset.top,
      outerWidth: this.newElement.outerWidth(),
      outerHeight: this.newElement.outerHeight()
    };

    this.newElement.css({ visibility: "hidden" });
    return liquid_fire.animate(this.oldElement, motion, opts).then(function () {
      _this.newElement.css({ visibility: "" });
    });
  }

});
define('oxide/transitions/move-over', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  exports['default'] = moveOver;

  function moveOver(dimension, direction, opts) {
    var _this = this;

    var oldParams = {},
        newParams = {},
        firstStep,
        property,
        measure;

    if (dimension.toLowerCase() === "x") {
      property = "translateX";
      measure = "width";
    } else {
      property = "translateY";
      measure = "height";
    }

    if (liquid_fire.isAnimating(this.oldElement, "moving-in")) {
      firstStep = liquid_fire.finish(this.oldElement, "moving-in");
    } else {
      liquid_fire.stop(this.oldElement);
      firstStep = liquid_fire.Promise.resolve();
    }

    return firstStep.then(function () {
      var bigger = biggestSize(_this, measure);
      oldParams[property] = bigger * direction + "px";
      newParams[property] = ["0px", -1 * bigger * direction + "px"];

      return liquid_fire.Promise.all([liquid_fire.animate(_this.oldElement, oldParams, opts), liquid_fire.animate(_this.newElement, newParams, opts, "moving-in")]);
    });
  }

  function biggestSize(context, dimension) {
    var sizes = [];
    if (context.newElement) {
      sizes.push(parseInt(context.newElement.css(dimension), 10));
      sizes.push(parseInt(context.newElement.parent().css(dimension), 10));
    }
    if (context.oldElement) {
      sizes.push(parseInt(context.oldElement.css(dimension), 10));
      sizes.push(parseInt(context.oldElement.parent().css(dimension), 10));
    }
    return Math.max.apply(null, sizes);
  }

});
define('oxide/transitions/scale', ['exports', 'liquid-fire'], function (exports, liquid_fire) {

  'use strict';



  exports['default'] = scale;
  function scale() {
    var _this = this;

    var opts = arguments[0] === undefined ? {} : arguments[0];

    return liquid_fire.animate(this.oldElement, { scale: [0.2, 1] }, opts).then(function () {
      return liquid_fire.animate(_this.newElement, { scale: [1, 0.2] }, opts);
    });
  }

});
define('oxide/transitions/scroll-then', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = function (nextTransitionName, options) {
    var _this = this;

    for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      rest[_key - 2] = arguments[_key];
    }

    Ember['default'].assert("You must provide a transition name as the first argument to scrollThen. Example: this.use('scrollThen', 'toLeft')", "string" === typeof nextTransitionName);

    var el = document.getElementsByTagName("html");
    var nextTransition = this.lookup(nextTransitionName);
    if (!options) {
      options = {};
    }

    Ember['default'].assert("The second argument to scrollThen is passed to Velocity's scroll function and must be an object", "object" === typeof options);

    // set scroll options via: this.use('scrollThen', 'ToLeft', {easing: 'spring'})
    options = Ember['default'].merge({ duration: 500, offset: 0 }, options);

    // additional args can be passed through after the scroll options object
    // like so: this.use('scrollThen', 'moveOver', {duration: 100}, 'x', -1);

    return window.$.Velocity(el, "scroll", options).then(function () {
      nextTransition.apply(_this, rest);
    });
  };

});
define('oxide/transitions/to-down', ['exports', 'oxide/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, "y", 1, opts);
  };

});
define('oxide/transitions/to-left', ['exports', 'oxide/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, "x", -1, opts);
  };

});
define('oxide/transitions/to-right', ['exports', 'oxide/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, "x", 1, opts);
  };

});
define('oxide/transitions/to-up', ['exports', 'oxide/transitions/move-over'], function (exports, moveOver) {

  'use strict';

  exports['default'] = function (opts) {
    return moveOver['default'].call(this, "y", -1, opts);
  };

});
define('oxide/utils/mobile', ['exports'], function (exports) {

	'use strict';

	var mobileQuery = matchMedia("(max-width: 900px)");

	exports['default'] = mobileQuery;

});
define('oxide/utils/nitrogen-ember-utils', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var nitrogenEmberUtils = {
        /**
         * Find or create a user in Ember Data,
         * sourcing information from a Nitrogen
         * principal.
         * @param  {Ember Data store} store        [Ember Data Store to be used]
         * @param  {session} session               [Session object]
         * @param  {Nitrogen principal} principal  [Nitrogen principal, source of information]
         * @return {promise}
         */
        findOrCreateUser: function findOrCreateUser(store, session, principal) {
            var self = this;

            if (!store || !session || !principal) {
                return console.error("Called Ember Util findOrCreateUser with missing paramters:", arguments);
            }

            return new Ember['default'].RSVP.Promise(function (resolve) {
                store.find("user", {
                    id: "me"
                }).then(function (foundUser) {
                    if (foundUser.content.length > 0) {
                        foundUser = foundUser.content[0];

                        self.updateUser(foundUser, principal, session).then(function (result) {
                            resolve(result);
                        });
                    }
                }, function () {
                    var user = store.createRecord("user", {
                        id: "me"
                    });

                    self.updateUser(user, principal, session).then(function (result) {
                        resolve(result);
                    });
                });
            });
        },

        /**
         * Updates a user record with information received
         * from Nitrogen
         * @param  {Ember Data record (user)} user       [Record for the user that shall be modified]
         * @param  {Nitrogen principal} principal        [Nitrogen principal, the source of information]
         * @param  {session} session                     [Current Session]
         * @return {promise}                             [Ember Data promise (save)]
         */
        updateUser: function updateUser(user, principal, session) {
            if (!user || !principal || !session) {
                return console.error("Called Ember Util updateUser with missing paramters:", arguments);
            }

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

            return user.save();
        },

        /**
         * Updates a device record with information received
         * from Nitrogenm
         * @param  {Ember data record (device)} device [Device to update]
         * @param  {Nitrogen principal} principal      [Nitrogen principal to use as source of information]
         * @return {promise}                           [Ember Data promise (save)]
         */
        updateDevice: function updateDevice(device, principal) {
            if (!device || !principal) {
                return console.error("Called Ember Util updateDevice with missing paramters:", arguments);
            }

            device.set("nitrogen_id", principal.id);
            device.set("name", principal.name);
            device.set("lastUpdated", principal.updated_at);
            device.set("last_connection", principal.last_connection);
            device.set("last_ip", principal.last_ip);
            device.set("nickname", principal.nickname);
            device.set("updated_at", principal.updated_at);
            device.set("created_at", principal.created_at);
            device.set("tags", principal.tags);
            device.set("type", principal.type);
            device.set("location", principal.location);
            device.set("gps", []);

            return device.save();
        },

        /**
         * Create a new device using a Nitrogen
         * principal as source
         * @param  {Ember data store} store       [Store to use]
         * @param  {Nitrogen principal} principal [Nitrogen principal to use as source of information]
         * @return {promise}                      [Ember Data promise (save)]
         */
        newDevice: (function (_newDevice) {
            var _newDeviceWrapper = function newDevice(_x, _x2) {
                return _newDevice.apply(this, arguments);
            };

            _newDeviceWrapper.toString = function () {
                return _newDevice.toString();
            };

            return _newDeviceWrapper;
        })(function (store, principal) {
            if (!store || !principal) {
                return console.error("Called Ember Util newDevice with missing paramters:", store, principal);
            }

            var newDevice = store.createRecord("device");

            return this.updateDevice(newDevice, principal);
        }),

        /**
         * Remove locally stored devices for a principal
         * @param  {array} principals            [Principals to lookup (and remove)]
         * @param  {Ember data store} store      [Store to use]
         * @return {promise}
         */
        removeDevices: function removeDevices(principals, store) {
            if (!store || !principals) {
                return console.error("Called Ember Util removeDevices with missing paramters:", arguments);
            }

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

        /**
         * Lookup a locally stored device for a Nitrogen principal
         * @param  {Nitrogen principal} principal  [Nitrogen principal to lookup]
         * @param  {Ember data store} store        [Store to use]
         * @return {promise}
         */
        lookupDevice: function lookupDevice(principal, store) {
            var self = this;

            if (!store || !principal) {
                return console.error("Called Ember Util lookupDevice with missing paramters:", arguments);
            }

            return new Ember['default'].RSVP.Promise(function (resolve) {
                store.find("device", {
                    nitrogen_id: principal.id
                }).then(function (foundDevices) {
                    if (foundDevices.get("length") === 0) {
                        return self.newDevice(store, principal);
                    }

                    if (foundDevices.get("length") > 1) {
                        console.log("WARNING: Multiple devices in store for one Nitrogen id!");
                        console.log("Number of devices in store for this id: " + foundDevices.get("length"));
                    }

                    foundDevices.map(function (foundDevice) {
                        self.updateDevice(foundDevice, principal);
                    });

                    resolve();
                }, function () {
                    resolve(self.newDevice(store, principal));
                });
            });
        },

        /**
         * Update or create local devices to match the devices
         * Nitrogen has for a single user
         * @param  {Ember Data store} store   [Store to use]
         * @param  {session} session          [Session to use]
         * @return {promise}
         */
        updateOrCreateDevices: function updateOrCreateDevices(store, session) {
            var self = this;

            if (!store || !session) {
                return console.error("Called Ember Util updateOrCreateDevices with missing paramters:", arguments);
            }

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
                            return self.lookupDevice(principal, store);
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
define('oxide/views/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        removeLoader: (function () {
            var $loader = $(".background-loader");

            if ($loader.length) {
                $loader.remove();
            }
        }).on("didInsertElement")
    });

});
define('oxide/views/settings', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        showConfigString: false,

        actions: {
            toggleShowConfig: function toggleShowConfig() {
                this.toggleProperty("showConfigString");
            }
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
  require("oxide/app")["default"].create({"nitrogen":{"host":"api.nitrogen.io","protocol":"https","http_port":443,"log_levels":["warn","error"]},"API_HOST":"http://demo2736407.mockable.io","name":"oxide","version":"0.0.0.4abd52f7"});
}

/* jshint ignore:end */
//# sourceMappingURL=oxide.map