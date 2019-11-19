import { Server } from 'socket.io';
import { WSConfig } from './WSConfig';
import { WSResponse } from './WSResponse';
export interface Method {
    method: string;
    arguments: string[];
    httpMethod?: string;
}
export declare class APIManager {
    io?: Server;
    config: WSConfig;
    actions: {
        [action: string]: any;
    };
    resultObject: typeof WSResponse;
    private apiConfigCache;
    private errors;
    get url(): string;
    get sessionSecret(): string;
    get sessionCookieName(): string;
    get browserSocketVariableName(): null;
    get responseEventName(): string;
    get setCookieEventName(): string;
    get errorEventName(): string;
    get callEventName(): string;
    get initEventName(): string;
    get namespace(): string;
    constructor(config?: any);
    setSocket(socket: Server): void;
    initListeners(): void;
    add(actionName: any, object?: any): void;
    getActions(): {
        [action: string]: any;
    };
    sendResponse(response: WSResponse, incomingMessage: any, socket: any, eventName: string): void;
    sendError(err: any, incomingMessage: any, socket: any): void;
    getScript(): string;
    getConfig(): WSConfig;
    getMethods(action: any): Method[];
    private validateMessage;
    private isExistsActionMethod;
    private onMessage;
    private createResponse;
    private getApiConfig;
    private getArtuments;
}
