import type { ServerOptions } from 'socket.io';
export declare class WSConfig {
    url: string;
    sessionSecret: string;
    sessionCookieName: string;
    browserSocketVariableName: null;
    responseEventName: string;
    setCookieEventName: string;
    errorEventName: string;
    callEventName: string;
    initEventName: string;
    namespace: string;
    serverOptions?: ServerOptions;
    info?: (...data: any[]) => void;
    warn?: (...data: any[]) => void;
    error?: (...data: any[]) => void;
    constructor(cfg?: any);
}
