"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = require("eventemitter3");
const restify_1 = require("restify");
const RestifyResponse_1 = require("./RestifyResponse");
class RestifyServer extends eventemitter3_1.EventEmitter {
    constructor(manager) {
        super();
        this.manager = manager;
        this.actions = {};
        this.server = restify_1.createServer(manager.getConfig().restifyServerOptions);
        this.server.use(restify_1.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify_1.plugins.queryParser());
        this.server.use(restify_1.plugins.fullResponse());
        this.server.use(restify_1.plugins.bodyParser());
        this.init();
    }
    getServer() {
        return this.server;
    }
    async emitAsync(event, a1, a2, a3, a4, a5) {
        const all = [];
        const me = this;
        if (!me._events[event]) {
            return false;
        }
        const listeners = me._events[event];
        const len = arguments.length;
        let args;
        let i;
        if (listeners.fn) {
            if (listeners.once) {
                this.removeListener(event, listeners.fn, undefined, true);
            }
            switch (len) {
                case 1:
                    await listeners.fn.call(listeners.context);
                    return true;
                case 2:
                    await listeners.fn.call(listeners.context, a1);
                    return true;
                case 3:
                    await listeners.fn.call(listeners.context, a1, a2);
                    return true;
                case 4:
                    await listeners.fn.call(listeners.context, a1, a2, a3);
                    return true;
                case 5:
                    await listeners.fn.call(listeners.context, a1, a2, a3, a4);
                    return true;
                case 6:
                    await listeners.fn.call(listeners.context, a1, a2, a3, a4, a5);
                    return true;
            }
            args = new Array(len - 1);
            for (i = 1; i < len; i += 1) {
                args[i - 1] = arguments[i];
            }
            all.push(listeners.fn.apply(listeners.context, args));
        }
        else {
            const length = listeners.length;
            let j;
            for (i = 0; i < length; i += 1) {
                if (listeners[i].once) {
                    this.removeListener(event, listeners[i].fn, undefined, true);
                }
                switch (len) {
                    case 1:
                        listeners[i].fn.call(listeners[i].context);
                        break;
                    case 2:
                        listeners[i].fn.call(listeners[i].context, a1);
                        break;
                    case 3:
                        listeners[i].fn.call(listeners[i].context, a1, a2);
                        break;
                    case 4:
                        listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                        break;
                    default:
                        if (!args) {
                            args = new Array(len - 1);
                            for (j = 1; j < len; j += 1) {
                                args[j - 1] = arguments[j];
                            }
                        }
                        all.push(listeners[i].fn.apply(listeners[i].context, args));
                }
            }
        }
        await Promise.all(all);
        return true;
    }
    init() {
        const actions = this.manager.getActions();
        for (const actionName of Object.keys(actions)) {
            const methods = this.manager.getMethods(actionName);
            this.initAction(actionName, methods);
        }
    }
    initAction(actionName, methods) {
        const namespace = this.manager.namespace;
        this.actions[actionName] = {};
        for (const methodParams of methods) {
            this.actions[actionName][methodParams.method] = methodParams;
            const httpMethod = methodParams.httpMethod || 'post';
            const handler = this.createMethodHandler(actionName, methodParams);
            this.server[httpMethod](['', namespace, actionName, methodParams.method].join('/'), handler);
        }
    }
    createMethodHandler(actionName, methodParams) {
        return async (req, res, next) => {
            await this.callApiMethod(actionName, methodParams, req, res);
            next();
        };
    }
    getArguments(methodParams, req) {
        const queryParams = req.query;
        let resultParams = {};
        switch (methodParams.httpMethod) {
            default:
                resultParams = Object.assign({}, queryParams, req.body);
        }
        return methodParams.arguments.map((paramName) => {
            if (resultParams.hasOwnProperty(paramName)) {
                return resultParams[paramName];
            }
            else {
                throw new Error(`Parameter ${paramName} not found`);
            }
        });
    }
    createIncomingMessageStub(actionName, methodName, req) {
        return {
            event: this.manager.callEventName,
            action: actionName,
            method: methodName,
            httpRequest: req,
        };
    }
    async callApiMethod(actionName, methodParams, req, res) {
        const api = this.actions[actionName];
        const methodName = methodParams.method;
        const response = new RestifyResponse_1.RestifyResponse(api, this.createIncomingMessageStub(actionName, methodName, req), {}, req, res);
        try {
            const args = this.getArguments(methodParams, req);
            await this.emitAsync('beforeCall', response, args);
            const action = this.manager.getActions()[actionName];
            const callResult = await action[methodName]
                .apply(action, args.concat(response));
            response.setData(callResult);
            this.emitAsync('beforeSendResult', response, args);
            response.send();
            this.emit('afterSendResult', response, args);
        }
        catch (e) {
            response.setSuccess(false)
                .addParam('stack', e.stack || '')
                .setMessage(e.message);
            this.emitAsync('beforeSendError', response);
            response.send();
            this.emit('afterSendError', response);
        }
    }
}
exports.RestifyServer = RestifyServer;
