import { APIManager } from './APIManager';
import { WSConfig } from './WSConfig';
export declare class APIServer {
    private port;
    private manager;
    private socket;
    private readonly config;
    private actions;
    constructor(config?: WSConfig | string, port?: number);
    run(server?: any): Promise<void>;
    getSocket(): any;
    getManager(): APIManager;
    add(actionName: string, action: object): void;
}
