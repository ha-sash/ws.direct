import * as SocketIO from "socket.io";
import { APIManager } from "./APIManager";
import { WSConfig } from "./WSConfig";

export class APIServer {

    private manager!: APIManager;
    private socket!: SocketIO.Server;
    private config: WSConfig;
    private actions: {[key: string]: object} = {};

    constructor(config: WSConfig | string, private port = 3500) {
        this.config = typeof config === "string" ? new WSConfig({url: config}) : config ;
    }

    public run() {
        this.socket = SocketIO.listen(this.port);
        this.manager = new APIManager(this.socket, this.config);
        this.manager.add(this.actions);
    }

    public getSocket(): SocketIO.Server {
        return this.socket;
    }

    public add(actionName: string,  action: object): void {
        this.actions[actionName] = action;
    }
}
