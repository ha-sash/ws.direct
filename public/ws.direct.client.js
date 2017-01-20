var WSDirectClient = function(config, socketio) {

    /**
     * @property defaultNamespace {string}
     * @property defaultApiCallEventName {string} - The name of the event to call functions on the server (used if no config)
     * @property socket {Object}
     * @property listeners {Object}
     * @property me {WSDirectClient}
     */
    var defaultNamespace = 'WSDirectAPI';
    var defaultApiCallEventName = 'api:call';
    var defaultApiResponseEventName = 'api:response';
    var defaultApiInitEventName = 'api:init';
    var defaultCookieEventName = 'api:setcookie';
    var socket = socketio;
    var listeners = {};
    var me = this;
    var inited = false;

    /**
     * Event name response for each provider
     * @type {object}
     */
    var handleResponceEventName = {};

    /**
     * Handlers list (key - call id : callback)
     * @type {object}
     */
    var handlers = {};

    if (!Function.prototype.bind) {
        throw new Error('Browser does not support function bind.');
    }

    try {
        if (config === undefined && window !== undefined) {
            config = `${location.protocol}//${location.host}`;
        }
        this.global = window;
    } catch (e) {
        this.global = global;
    }

    if (!(socket instanceof io.Socket) && config instanceof Object && config.url) {
        socket = io.connect(config.url);
    } else if (!(socket instanceof io.Socket) && typeof config === 'string') {
        socket = io.connect(config);
    }

    if (!(socket instanceof io.Socket)) {
        throw new Error('Not the correct type of the adapter');
    }

    socket.on('message', function(msg) {
        var handler, info, callbacks;

        if (msg.event !== undefined && msg.id !== undefined && handleResponceEventName[msg.event] && (handler = handlers[msg.id].handler)) {

            info = handlers[msg.id].info;

            if (!(handlers[msg.id].reject instanceof Function)) {
                handler(msg.result, msg);
            } else if (msg.success) {
                handler(msg.result);
            } else {
                handlers[msg.id].reject(msg);
            }

            callbacks = listeners[info.apiManager.getResultEventNameByMethodContext(info, 'response')];

            if (callbacks && callbacks.length > 0) {
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[0](msg.result, msg, info);
                }
            }


            delete handlers[msg.id];
            delete handler;
            delete info;
        }

        if (msg.event !== undefined && msg.event === defaultCookieEventName && navigator.cookieEnabled) {
            setCookie(msg);
        }

        if (msg.event !== undefined && msg.event === defaultApiInitEventName && msg.config) {
            me.addProvider(msg.config);
            me.onInit();
            inited = true;
        }
    });

    var setCookie = function(msg) {

        var c, value = encodeURIComponent(msg.result), opt = msg.options || {}, d = new Date();

        if (opt.expires instanceof Date) {
            opt.expires = opt.expires.toUTCString();
        } else if (typeof opt.expires === 'number' && opt.expires) {
            d.setTime(d.getTime() + opt.expires);
            opt.expires = d.toUTCString();
        }

        var c = msg.cookieName + '=' + value;

        for (var prop in opt) {
            c += '; ' + prop;
            if (opt[prop] !== true) {
                c += '=' + opt[prop];
            }
        }

        document.cookie = c;
    }

    /**
     * Add method to API
     *
     * @param methodsConfig {Object}
     * @param ns {Object}
     * @param actionName {string}
     * @param configProvider {Object}
     */
    var addMethods = function(methodsConfig, ns, actionName, configProvider) {
        for(var i=0;i<methodsConfig.length;i++) {
            var methodConfig = methodsConfig[i];
            methodConfig.action = actionName;

            if (methodConfig instanceof Object && methodConfig.method !== undefined) {
                if (methodConfig.arguments === undefined) {
                    methodConfig.arguments = [];
                }
                ns[methodConfig.method] = createMethod(methodConfig, configProvider);
            }
        }
    };

    /**
     * Get prefix for method name
     * @param context
     * @return {string}
     */
    this.getResultEventNameByMethodContext = function(context, eventName) {
        var cfg = context.config, en = cfg.action + ':' + cfg.method;
        if (eventName !== undefined) en += ':' + eventName;
        return en;
    }

    /**
     * Add callback for remote call
     * @param id {string} - call id
     * @param fn {function} - callback
     * @param methodInfo {object}
     * @param reject {function}/undefined
     */
    this.addHandler = function(id, fn, methodInfo, reject) {
        handlers[id] = {
            handler: (fn instanceof Function) ? fn : function(){},
            info: methodInfo,
            reject: reject
        };
    }

    /**
     * Add callback for permanent call processing.
     * @param eventName {string}
     * @param handler {Function}
     * @return {boolean}
     */
    this.addListener = function(eventName, handler) {
        if (handler instanceof Function) {
            if (listeners[eventName] === undefined) {
                listeners[eventName] = [];
            }

            listeners[eventName].push(handler)
            return true;
        }

        return false;
    };

    /**
     * Wrapper factory
     *
     * @param methodConfig {Object}
     * @param configProvider {Object}
     * @return {function} - remote call function
     */
    var createMethod = function(methodConfig, configProvider) {
        var context = {apiManager: me, config: methodConfig, provider: configProvider};
        var method = function() {
            var argsLength = this.config.arguments.length,
                realArgs   = Array.prototype.slice.call(arguments, 0, argsLength),
                callback   = arguments[argsLength],
                t = this;

            if (this.config.arguments.length != realArgs.length) {
                throw new Error('Necessary amount of arguments ' + argsLength);
            } else {
                var socket = me.getSocket();

                if (!(socket instanceof io.Socket)) {
                    throw new Error('Not the correct type of the adapter');
                }

                var id = me.guid();
                var remoteEvent = {
                    event:  this.provider.calleventname,
                    id:     id,
                    action: this.config.action,
                    method: this.config.method,
                    args:   realArgs
                }

                try {
                    if (callback instanceof Function) {
                        this.apiManager.addHandler(id, callback, this);
                        socket.send(remoteEvent);
                    } else {
                        return new Promise(function (resolve, reject) {
                            t.apiManager.addHandler(id, resolve, t, reject);
                            socket.send(remoteEvent);
                        });
                    }
                } catch(e) {
                    this.apiManager.addHandler(id, callback, this);
                    socket.send(remoteEvent);
                }

            }
        }.bind(context);

        handleResponceEventName[configProvider.responseeventname] = true;

        method.on = function(eventName, handler) {
            if (handler instanceof Function) {
                handler.bind(this);
                this.apiManager.addListener(me.getResultEventNameByMethodContext(this, eventName), handler);
                return true;
            }

            return false;
        }.bind(context);

        return method;
    };

    /**
     * Create an object in global scope.
     * it is possible to describe different levels of nesting using point
     * example:
     * <code>
     * ns('Ns.OK.trololo')
     *     //will create such a structure
     *     Ns = {
     *         OK: {
     *             trololo: {
     *             }
     *         }
     *     }
     * </code>
     *
     * @param namespace {string}
     * @return {*}
     */
    this.ns = function() {
        var a=arguments, o=null, i, j, d;
        for (i=0; i<a.length; i=i+1) {
            d=a[i].split(".");
            o=this.global;
            for (j=0; j<d.length; j=j+1) {
                o[d[j]]=o[d[j]] || {};
                o=o[d[j]];
            }
        }
        return o;
    };

    /**
     * @return {string}
     */
    this.getDefaultApiCallEventName = function() {
        return defaultApiCallEventName;
    };

    /**
     * @return {string}
     */
    this.getDefaultApiResponseEventName = function() {
        return defaultApiResponseEventName;
    };

    /**
     * @param conf {Object}
     * @return {boolean}
     */
    this.addProvider = function(conf) {
        if (conf instanceof Object && conf.actions && conf.actions instanceof Object) {
            var ns = this.ns(conf.namespace || defaultNamespace);

            if (conf.calleventname === undefined) {
                conf.calleventname = this.getDefaultApiCallEventName();
            }

            if (conf.responseeventname === undefined) {
                conf.responseeventname = this.getDefaultApiResponseEventName();
            }

            for(var i in conf.actions) {
                var action = conf.actions[i];
                ns[i] = {};
                addMethods(action, ns[i], i, conf);
            }

            ns.$APIManager = this;
            return true;
        }
        return false;
    };

    /**
     * Get socket io connection adapter
     * @return {io.Socket}
     */
    this.getSocket = function() {
        return socket;
    };

    /**
     * @return {string}
     */
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };

    /**
     * GUID generate
     * @return {string}
     */
    this.guid = function() {
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    };

    this.onInit = function() {};

    if (typeof config === 'string') {
        socket.on('connect', function(msg) {
            if (!inited) {
                socket.send({event: defaultApiInitEventName});
            }
        });
    } else {
        if (config !== undefined) {
            this.addProvider(config);
            this.onInit();
            inited = true;
        }
    }

    //socket.on('disconnect', function(msg) {});

};

if (typeof module === 'object' && module.exports) {
    module.exports = WSDirectClient;
}