import { Request, Response } from 'restify';
import { WSResponse } from './WSResponse';
export declare class RestifyResponse extends WSResponse {
    api: any;
    incomingMessage: any;
    socket: any;
    request: Request;
    response: Response;
    constructor(api: any, incomingMessage: any, socket: any, request: Request, response: Response);
    setCookie(): void;
    send(): void;
}
