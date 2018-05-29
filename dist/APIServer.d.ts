import * as SocketIO from "socket.io";
import { WSConfig } from "./WSConfig";
export declare class APIServer {
    private port;
    private manager;
    private socket;
    private config;
    private actions;
    constructor(config: WSConfig | string, port?: number);
    run(server?: any): void;
    getSocket(): SocketIO.Server;
    add(actionName: string, action: object): void;
}
