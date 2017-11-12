"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIError = require("./APIErrors");
const WSConfig_1 = require("./WSConfig");
const WSResponse_1 = require("./WSResponse");
class APIManager {
    constructor(io, config = {}) {
        this.io = io;
        this.actions = {};
        this.resultObject = WSResponse_1.WSResponse;
        this.errors = APIError;
        this.config = new WSConfig_1.WSConfig(config);
        this.initListeners();
    }
    get url() {
        return this.config.url;
    }
    get sessionSecret() {
        return this.config.sessionSecret;
    }
    get sessionCookieName() {
        return this.config.sessionCookieName;
    }
    get browserSocketVariableName() {
        return this.config.browserSocketVariableName;
    }
    get responseEventName() {
        return this.config.responseEventName;
    }
    get setCookieEventName() {
        return this.config.setCookieEventName;
    }
    get errorEventName() {
        return this.config.errorEventName;
    }
    get callEventName() {
        return this.config.callEventName;
    }
    get initEventName() {
        return this.config.initEventName;
    }
    get namespace() {
        return this.config.namespace;
    }
    add(actionName, object) {
        if (actionName instanceof Object && object === undefined) {
            for (const i in actionName) {
                if (actionName.hasOwnProperty(i)) {
                    this.add(i, actionName[i]);
                }
            }
        }
        else if (this.actions[actionName] === undefined && object !== undefined && object instanceof Object) {
            if (object.apiMethods === undefined || typeof object.apiMethods !== "function") {
                throw new Error(`API ('${actionName}) object has to have a method "apiMethods"`);
            }
            this.actions[actionName] = object;
        }
    }
    sendResponse(response, incomingMessage, socket, eventName) {
        const result = {
            event: eventName || this.config.responseEventName,
            id: incomingMessage.id,
            result: response.getData(),
            success: response.isSuccess(),
            msg: response.getMessage(),
        };
        socket.json.send(Object.assign({}, response.getExtraParams(), result));
    }
    sendError(err, incomingMessage, socket) {
        let msg = {};
        if (err instanceof Object) {
            msg = err;
        }
        else if (typeof err === "string" && this.errors[err]) {
            const tmpl = this.errors[err];
            let text = tmpl.msg;
            for (const i in msg) {
                if (msg.hasOwnProperty(i)) {
                    text = text.replace(`{${i}`, msg[i]);
                }
            }
            msg = {
                type: tmpl.type,
                msg: tmpl.msg,
                code: err,
            };
        }
        msg.id = incomingMessage.id;
        socket.json.send(msg);
    }
    getScript() {
        const script = [];
        script.push("(function() {", "var WSDClient = new WSDirectClient(", JSON.stringify(this.getApiConfig()), this.browserSocketVariableName === null ? "" : `, ${this.browserSocketVariableName}`, ");", "})();");
        return script.join("");
    }
    validateMessage(incomingMessage, socket) {
        let result = false;
        let err = false;
        if (incomingMessage.id === undefined) {
            err = "apiCallMsgIdNotFound";
        }
        else if (incomingMessage.action === undefined) {
            err = "apiCallMsgActionNotFound";
        }
        else if (this.actions[incomingMessage.action] === undefined) {
            err = "apiCallActionObjectNotFound";
        }
        else if (incomingMessage.method === undefined) {
            err = "apiCallMsgMethodNotFound";
        }
        else if (incomingMessage.args === undefined) {
            err = "apiCallMsgArgsNotFound";
        }
        else if (!Array.isArray(incomingMessage.args)) {
            err = "apiCallMsgArgsIsNotArray";
        }
        else if (!this.isExistsActionMethod(incomingMessage.action, incomingMessage.method)) {
            err = "apiCallMethodNotFoundInObject";
        }
        else {
            result = true;
        }
        if (err) {
            this.sendError(err, incomingMessage, socket);
        }
        return result;
    }
    isExistsActionMethod(actionName, methodName) {
        const action = this.actions[actionName];
        if (!action) {
            return false;
        }
        if (!action.apiMethods().hasOwnProperty(methodName)) {
            return false;
        }
        return typeof action[methodName] === "function";
    }
    onMessage(incomingMessage, socket) {
        if (incomingMessage.event == this.config.callEventName) {
            if (this.validateMessage(incomingMessage, socket)) {
                const api = this.actions[incomingMessage.action];
                const result = this.createResponse(incomingMessage, socket);
                try {
                    const callResult = api[incomingMessage.method].apply(api, incomingMessage.args.concat(result));
                    if (callResult instanceof Promise) {
                        callResult.then((data) => {
                            result.setData(data).send();
                        }).catch((e) => {
                            result.setSuccess(false).addParam("stack", e.stack || "").setMessage(e.message).send();
                        });
                    }
                    else {
                        if (!result.isSent) {
                            result.setData(callResult).send();
                        }
                    }
                }
                catch (e) {
                    result.setSuccess(false).addParam("stack", e.stack || "").setMessage(e.message).send();
                }
            }
        }
        else if (incomingMessage.event == this.config.initEventName) {
            if (!this.apiConfigCache) {
                this.apiConfigCache = this.getApiConfig();
            }
            socket.json.send({ event: this.config.initEventName, config: this.apiConfigCache });
        }
    }
    createResponse(incomingMessage, socket) {
        return new this.resultObject(this, incomingMessage, socket);
    }
    getApiConfig() {
        const result = {
            namespace: this.config.namespace,
            url: this.config.url,
            calleventname: this.config.callEventName,
            responseeventname: this.config.responseEventName,
            erroreventname: this.config.errorEventName,
            actions: {},
        };
        for (const i in this.actions) {
            if (this.actions.hasOwnProperty(i)) {
                result.actions[i] = this.getMethods(this.actions[i]);
            }
        }
        return result;
    }
    getMethods(action) {
        const methods = [];
        let publicMethods;
        if (typeof action === "string") {
            action = this.actions[action];
        }
        publicMethods = action.apiMethods();
        for (const methodName in publicMethods) {
            if (publicMethods[methodName] && action[methodName] instanceof Function) {
                const args = this.getArtuments(action[methodName]);
                methods.push({
                    method: methodName,
                    arguments: args.slice(0, args.length - 1),
                });
            }
        }
        return methods;
    }
    getArtuments(fn) {
        const strFn = fn.toString().replace(/^async /i, "");
        const fnHeader = strFn.match(/^[a-z0-9_]+(?:\s|)\((.*?)\)/gi);
        if (fnHeader && fnHeader[0]) {
            return fnHeader[0].replace(/^[a-z0-9_]+(?:\s|)\(/gi, "").replace(/\)/g, "").split(", ");
        }
        return [];
    }
    initListeners() {
        this.io.sockets.on("connection", (socket) => {
            socket.on("message", (incomingMessage) => {
                this.onMessage(incomingMessage, socket);
            });
        });
    }
}
exports.APIManager = APIManager;
