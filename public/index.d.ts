export class WSDirectClient {
    constructor(config: any, socketio?: SocketIO.Client, onConnectCb?: (c: WSDirectClient) => void);

    public addHandler(id: string, fn: () => void, methodInfo: MethodInfo, reject?: () => void): void;

    public addListener(eventName: string, handler: () => void): boolean;

    public getSocket(): SocketIO.Client;

    public getProviders(): {[action: string]: { [method: string]: (...args: any[]) => Promise<any> }};

    public onInit(): void;
}

export interface MethodInfo {
    id: string;
}
