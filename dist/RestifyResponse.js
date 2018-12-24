"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WSResponse_1 = require("./WSResponse");
class RestifyResponse extends WSResponse_1.WSResponse {
    constructor(api, incomingMessage, socket, request, response) {
        super(api, incomingMessage, socket);
        this.api = api;
        this.incomingMessage = incomingMessage;
        this.socket = socket;
        this.request = request;
        this.response = response;
    }
    setCookie() {
        // empty
    }
    send() {
        if (!this.isSent) {
            this.response.status(this.isSuccess() ? 200 : 500);
            this.response.header('content-type', 'json');
            this.response.send({
                result: this.getData(),
                success: this.isSuccess(),
                msg: this.getMessage(),
            });
            this.isSent = true;
        }
    }
}
exports.RestifyResponse = RestifyResponse;
