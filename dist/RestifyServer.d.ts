/// <reference types="@types/node" />
import { EventEmitter } from 'events';
import { Server } from 'restify';
import { APIManager } from './APIManager';
export declare class RestifyServer extends EventEmitter {
    private manager;
    private server;
    private actions;
    constructor(manager: APIManager);
    getServer(): Server;
    private init;
    private initAction;
    private createMethodHandler;
    private getArguments;
    private createIncomingMessageStub;
    private callApiMethod;
}
