export declare class WSResponse {
    api: any;
    incomingMessage: any;
    socket: SocketIO.Socket;
    data: any;
    success: boolean;
    message: string;
    extra: {
        [k: string]: any;
    };
    isSent: boolean;
    constructor(api: any, incomingMessage: any, socket: SocketIO.Socket);
    isResult(): true;
    setData(data: any): this;
    getData(): any;
    setMessage(message: string): this;
    getMessage(): string;
    setSuccess(success: boolean): this;
    isSuccess(): boolean;
    addParam(name: string, value: any): this;
    getExtraParams(): {
        [k: string]: any;
    };
    send(): void;
    setCookie(): void;
    getSocket(): SocketIO.Socket;
    getSession(): any;
}
