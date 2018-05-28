"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
const APIManager_1 = require("./APIManager");
const WSConfig_1 = require("./WSConfig");
class APIServer {
    constructor(config, port = 3500) {
        this.port = port;
        this.actions = {};
        this.config = typeof config === "string" ? new WSConfig_1.WSConfig({ url: config }) : config;
    }
    run(server) {
        this.socket = server || SocketIO.listen(this.port);
        this.manager = new APIManager_1.APIManager(this.socket, this.config);
        this.manager.add(this.actions);
    }
    getSocket() {
        return this.socket;
    }
    add(actionName, action) {
        this.actions[actionName] = action;
    }
}
exports.APIServer = APIServer;
