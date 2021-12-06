"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIServer = void 0;
const socket_io_1 = require("socket.io");
const APIManager_1 = require("./APIManager");
const logs_1 = require("./utils/logs");
const WSConfig_1 = require("./WSConfig");
class APIServer {
    constructor(config, port = 3500) {
        this.port = port;
        this.info = logs_1.info;
        this.warn = logs_1.warn;
        this.error = logs_1.error;
        this.actions = {};
        if (!config) {
            this.config = new WSConfig_1.WSConfig();
        }
        else if (typeof config === 'string') {
            this.config = new WSConfig_1.WSConfig({ url: config });
        }
        else {
            this.config = config;
        }
    }
    async run(server) {
        this.socket = server;
        this.manager = new APIManager_1.APIManager(this.config);
        this.manager.add(this.actions);
        if (!this.socket) {
            const srv = new socket_io_1.Server(this.config.serverOptions);
            this.socket = srv.listen(this.port);
        }
        this.manager.setSocket(this.socket);
        this.manager.initListeners();
    }
    getSocket() {
        return this.socket;
    }
    getManager() {
        return this.manager;
    }
    add(actionName, action) {
        this.actions[actionName] = action;
        this.info('');
    }
}
exports.APIServer = APIServer;
