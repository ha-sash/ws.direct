import { WSDirectClient } from "../public";
export declare class APIClient {
    private url;
    timeout: number;
    private client;
    constructor(url?: string | undefined);
    connect(url?: string): Promise<WSDirectClient>;
    getAction<T>(actionName: string): T;
    getApi(): {
        [action: string]: {
            [method: string]: (...args: any[]) => Promise<any>;
        };
    };
}
