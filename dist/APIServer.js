"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
const APIManager_1 = require("./APIManager");
const WSConfig_1 = require("./WSConfig");
class APIServer {
    constructor(config, port = 3500) {
        this.port = port;
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
        const restServer = await this.initRestifyServer();
        if (restServer) {
            if (!this.socket) {
                this.socket = SocketIO.listen(restServer.server);
            }
            else {
                if (!this.socket.httpServer) {
                    this.socket.attach(restServer.server);
                }
                else {
                    throw new Error('HTTP server has already been added.');
                }
            }
            restServer.listen(this.port);
        }
        if (!this.socket) {
            this.socket = SocketIO.listen(this.port);
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
    }
    getRestifyServer() {
        return this.restifyServer;
    }
    async initRestifyServer() {
        const config = this.manager.getConfig();
        if (config.restifyServerOptions) {
            const { RestifyServer } = await Promise.resolve().then(() => require('./RestifyServer'));
            const server = new RestifyServer(this.manager);
            this.restifyServer = server;
            return server.getServer();
        }
        return false;
    }
}
exports.APIServer = APIServer;
