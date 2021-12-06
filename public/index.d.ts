export class WSDirectClient {
    constructor(
      config: any,
      socketio?: any,
      onConnectCb?: (c: WSDirectClient) => void,
      onConnectErrorCb?: (err: Error) => void,
    );

    public addHandler(id: string, fn: () => void, methodInfo: MethodInfo, reject?: () => void): void;

    public addListener(eventName: string, handler: () => void): boolean;

    public getSocket(): any;

    public getProviders(): {[action: string]: { [method: string]: (...args: any[]) => Promise<any> }};

    public onInit(): void;

    public onError(): void;
}

export interface MethodInfo {
    id: string;
}
