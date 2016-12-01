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
    var socket = socketio;
    var listeners = {};
    var me = this;

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
        this.global = window;
    } catch (e) {
        this.global = global;
    }

    if (!(socket instanceof io.Socket) && config instanceof Object && config.url) {
        socket = io.connect(config.url);
    }

    if (!(socket instanceof io.Socket)) {
        throw new Error('Not the correct type of the adapter');
    }

    socket.on('message', function(msg) {
        var handler, info, callbacks;
        if (msg.event !== undefined && msg.id !== undefined && handleResponceEventName[msg.event] && (handler = handlers[msg.id].handler)) {
            handler(msg.result, msg);
            info = handlers[msg.id].info;

            callbacks = listeners[info.apiManager.getResultEventNameByMethodContext(info, 'response')];

            if (callbacks && callbacks.length > 0) {
                for (var i=0;i<callbacks.length;i++) {
                    callbacks[0](msg.result, msg, info);
                }
            }

            delete handlers[msg.id];
            delete handler;
            delete info;
        }
    });

    //socket.on('connect', function(msg) {});
    //socket.on('disconnect', function(msg) {});

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
     */
    this.addHandler = function(id, fn, methodInfo) {
        handlers[id] = {
            handler: (fn instanceof Function) ? fn : function(){},
            info: methodInfo
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
                callback   = arguments[argsLength];

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

                this.apiManager.addHandler(id, callback, this);
                socket.send(remoteEvent);
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
        if (conf instanceof Object && config.actions && config.actions instanceof Object) {
            var ns = this.ns(config.namespace || defaultNamespace);

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

    if (config !== undefined) {
        this.addProvider(config);
    }

};

if (typeof module === 'object' && module.exports) {
    module.exports = WSDirectClient;
}