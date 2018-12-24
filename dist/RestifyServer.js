"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const restify_1 = require("restify");
const RestifyResponse_1 = require("./RestifyResponse");
class RestifyServer extends events_1.EventEmitter {
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
            this.emit('beforeCall', response, args);
            const callResult = await this.manager.getActions()[actionName][methodName]
                .apply(api, args.concat(response));
            response.setData(callResult);
            this.emit('beforeSendResult', response, args);
            response.send();
            this.emit('afterSendResult', response, args);
        }
        catch (e) {
            response.setSuccess(false)
                .addParam('stack', e.stack || '')
                .setMessage(e.message);
            this.emit('beforeSendError', response);
            response.send();
            this.emit('afterSendError', response);
        }
    }
}
exports.RestifyServer = RestifyServer;
