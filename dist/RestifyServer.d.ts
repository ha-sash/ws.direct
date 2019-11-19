import { EventEmitter } from 'eventemitter3';
import { Server } from 'restify';
import { APIManager } from './APIManager';
export declare class RestifyServer extends EventEmitter {
    private manager;
    private server;
    private actions;
    constructor(manager: APIManager);
    getServer(): Server;
    emitAsync(event: string, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any): Promise<boolean>;
    private init;
    private initAction;
    private createMethodHandler;
    private getArguments;
    private createIncomingMessageStub;
    private callApiMethod;
}
