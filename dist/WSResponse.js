"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WSResponse {
    constructor(api, incomingMessage, socket) {
        this.api = api;
        this.incomingMessage = incomingMessage;
        this.socket = socket;
        this.success = true;
        this.message = "Ok";
        this.extra = {};
        this.isSent = false;
    }
    isResult() {
        return true;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    getData() {
        return this.data;
    }
    setMessage(message) {
        this.message = message;
        return this;
    }
    getMessage() {
        return this.message;
    }
    setSuccess(success) {
        this.success = success;
        return this;
    }
    isSuccess() {
        return this.success;
    }
    addParam(name, value) {
        this.extra[name] = value;
        return this;
    }
    getExtraParams() {
        return this.extra;
    }
    send() {
        if (!this.isSent) {
            this.api.sendResponse(this, this.incomingMessage, this.getSocket());
            this.isSent = true;
        }
    }
    setCookie() {
        let msg = this.incomingMessage;
        if (typeof msg !== "string") {
            msg = JSON.stringify(msg);
        }
        this.api.sendResponse(this, msg, this.getSocket(), this.api.config.setCookieEventName);
    }
    getSocket() {
        return this.socket;
    }
    getSession() {
        return this.socket.session;
    }
}
exports.WSResponse = WSResponse;
