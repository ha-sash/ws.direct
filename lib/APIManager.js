const Result = require('./Result');

/**
 * API manager
 */
class APIManager {

    constructor(io, config) {
        let cfg = {
            url: 'http://localhost:3000/',
            sessionCookieName: 'connect.sid',
            sessionSecret: '',
            browserSocketVariableName: null,
            responseEventName: 'api:response',
            setCookieEventName: 'api:setcookie',
            errorEventName: 'api:error',
            callEventName: 'api:call',
            initEventName: 'api:init',
            namespace: 'wsdirect'
        };

        Object.assign(cfg, config);

        for (let i in cfg) {
            this[i] = cfg[i];
        }

        this.resultObject = Result;
        this.actions = {};
        this.io = io;
        this.initErrors();
        this.initListeners();
    }

    initErrors() {
        this.errors = {
            api_call_msg_id_not_found: {
                type: 'global_error',
                msg:  'Not found api call id.'
            },
            api_call_msg_action_not_found: {
                type: 'global_error',
                msg:  'Action {action} is not found.'
            },
            api_call_action_object_not_found: {
                type: 'global_error',
                msg:  'Not found action object by action name {action}.'
            },
            api_call_msg_method_not_found: {
                type: 'global_error',
                msg:  'Not found api call method.'
            },
            api_call_method_not_found_in_object: {
                type: 'global_error',
                msg:  'Not found action method by method name {method} in action {action}.'
            },
            api_call_msg_args_not_found: {
                type: 'global_error',
                msg:  'Not found api call args.'
            },
            api_call_msg_args_is_not_array: {
                type: 'global_error',
                msg:  'Not valid api call args for action {action} and method {method}.'
            }
        };
    }

    /**
     * Send response
     * @param response {object}
     */
    sendResponse(response, msg, socket, eventName) {
        var result = {
            event:   eventName || this.responseEventName,
            id:      msg.id,
            result:  response.getData(),
            success: response.isSuccess(),
            msg:     response.getMessage()
        };

        socket.json.send(Object.assign({}, response.getExtraParams(), result));
    }

    /**
     * Send error
     * @param err
     * @param msg
     */
    sendError(err, msg, socket) {
        var msg = {};
        if (err instanceof Object) {
            msg = err;
        } else if (typeof err === 'string' && this.errors[err]) {
            var tmpl = this.errors[err], text = tmpl.msg;

            for (var i in msg) {
                text.replace('{'+i+'}', msg[i]);
            }

            msg = {
                type: tmpl.type,
                msg: tmpl.msg,
                code: err
            };
        } else {

        }

        socket.json.send(msg);
    }

    /**
     * Validate the incoming message
     * @param msg {object}
     * @return {boolean}
     */
    validateMessage(msg, socket) {
        var result = false, err = false;
        if (msg.id === undefined)                        err = 'api_call_msg_id_not_found';
        else if (msg.action === undefined)               err = 'api_call_msg_action_not_found';
        else if (this.actions[msg.action] === undefined) err = 'api_call_action_object_not_found';
        else if (msg.method === undefined)               err = 'api_call_msg_method_not_found';
        else if (msg.args === undefined)                 err = 'api_call_msg_args_not_found';
        else if (!Array.isArray(msg.args))               err = 'api_call_msg_args_is_not_array';
        else if (!this.actions[msg.action].apiMethods().hasOwnProperty(msg.method) || this.actions[msg.action][msg.method] === undefined || typeof this.actions[msg.action][msg.method] !== 'function')
            err = 'api_call_method_not_found_in_object';
        else
            result = true;

        if (err) {
            this.sendError(err, msg, socket);
        }

        return result;
    }

    /**
     * Message processing
     * @param msg {object}
     * @param socket {Socket}
     */
    onMessage(msg, socket) {
        if (msg.event == this.callEventName) {
            if (this.validateMessage(msg, socket)) {
                var api = this.actions[msg.action], result = this.createResult(msg, socket);

                try {
                    api[msg.method].apply(api, msg.args.concat(result));
                } catch (e) {
                    result.setSuccess(false).addParam('stack', e.stack || '').setMessage(e.message).send();
                }
            }
        } else if (msg.event == this.initEventName) {
            if (!this.apiConfigCache) {
                this.apiConfigCache = this.getApiConfig();
            }
            socket.json.send({event: this.initEventName, config: this.apiConfigCache});
        }
    }

    /**
     * Create result object
     * @param msg {object}
     * @param socket {Socket}
     * @returns {APIManager.resultObject}
     */
    createResult(msg, socket) {
        return new this.resultObject(this, msg, socket);
    }

    initListeners() {
        var me = this;
        this.io.sockets.on('connection', function(socket) {
            socket.on('message', function(msg) {
                me.onMessage(msg, socket);
            });
        });
    }

    /**
     * Add one or more objects in the API.
     * @param actionName {string}|{object}
     * @param object {Objcet}
     */
    add(actionName, object) {
        if (object === undefined && actionName instanceof Object) {
            for(let i in actionName) {
                this.add(i, actionName[i]);
            }
        } else if (this.actions[actionName] === undefined && object !== undefined && object instanceof Object) {
            if (object.apiMethods === undefined || typeof object.apiMethods !== 'function') {
                throw new Error('API ('+actionName+') object has to have a method "apiMethods"');
            }
            
            this.actions[actionName] = object;
        }
    }

    /**
     * Get client API config
     * @returns {object}
     */
    getApiConfig() {
        var result = {
            namespace         : this.namespace,
            url               : this.url,
            calleventname     : this.callEventName,
            responseeventname : this.responseEventName,
            erroreventname    : this.errorEventName,
            actions           : {}
        };

        for(var i in this.actions) {
            result.actions[i] = this.getMethods(this.actions[i]);
        }

        return result;
    }

    /**
     * Get script for generate API on client
     * @return {string}
     */
    getScript() {
        var script = [];
        script.push(
            '(function() {',
            'var WSDClient = new WSDirectClient(',
            JSON.stringify(this.getApiConfig(), true, '    '),
            this.browserSocketVariableName === null ? '' : ', ' + this.browserSocketVariableName,
            ');',
            '})();'
        );

        return script.join('');
    }

    /**
     * List methods and arguments
     * @param action {action/string}
     * @return {Array}
     */
    getMethods(action) {
        var methods = [], publicMethods;

        if (typeof action === 'string') {
            action = this.actions[action];
        }

        publicMethods = action.apiMethods();

        for (let i in publicMethods) {
            if (publicMethods[i] && action[i] instanceof Function) {
                let args = this.getArtuments(action[i]);
                methods.push({
                    method: i,
                    arguments: args.slice(0, args.length-1)
                });
            }
        }

        return methods;
    }

    /**
     * The list of function arguments
     * @param fn
     * @return {Array}
     */
    getArtuments(fn) {
        var strFn = fn.toString().replace(/^async /i, ''), fnHeader = strFn.match(/^[a-z0-9_]+(?:\s|)\((.*?)\)/gi);
        if (fnHeader && fnHeader[0]) {
            return fnHeader[0].replace(/^[a-z0-9_]+(?:\s|)\(/gi, '').replace(/\)/g, '').split(', ');
        }

        return [];
    }

}

module.exports = APIManager;