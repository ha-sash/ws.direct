"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WSConfig {
    constructor(cfg = {}) {
        this.url = "http://localhost:3000/";
        this.sessionSecret = "";
        this.sessionCookieName = "connect.sid";
        this.browserSocketVariableName = null;
        this.responseEventName = "api:response";
        this.setCookieEventName = "api:setcookie";
        this.errorEventName = "api:error";
        this.callEventName = "api:call";
        this.initEventName = "api:init";
        this.namespace = "wsdirect";
        Object.assign(this, cfg);
    }
}
exports.WSConfig = WSConfig;
