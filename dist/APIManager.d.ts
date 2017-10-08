/// <reference types="socket.io" />
import { WSConfig } from "./WSConfig";
import { WSResponse } from "./WSResponse";
export declare class APIManager {
    io: SocketIO.Server;
    config: WSConfig;
    actions: {
        [action: string]: any;
    };
    resultObject: typeof WSResponse;
    private apiConfigCache;
    private errors;
    readonly url: string;
    readonly sessionSecret: string;
    readonly sessionCookieName: string;
    readonly browserSocketVariableName: null;
    readonly responseEventName: string;
    readonly setCookieEventName: string;
    readonly errorEventName: string;
    readonly callEventName: string;
    readonly initEventName: string;
    readonly namespace: string;
    constructor(io: SocketIO.Server, config?: any);
    add(actionName: any, object: any): void;
    sendResponse(response: WSResponse, incomingMessage: any, socket: SocketIO.Socket, eventName: string): void;
    sendError(err: any, incomingMessage: any, socket: SocketIO.Socket): void;
    getScript(): string;
    private validateMessage(incomingMessage, socket);
    private isExistsActionMethod(actionName, methodName);
    private onMessage(incomingMessage, socket);
    private createResponse(incomingMessage, socket);
    private getApiConfig();
    private getMethods(action);
    private getArtuments(fn);
    private initListeners();
}
