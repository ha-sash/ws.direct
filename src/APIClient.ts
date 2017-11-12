import { WSDirectClient } from "../public";

export class APIClient {

    public timeout = Infinity;
    private client: WSDirectClient;

    constructor(private url?: string) {}

    public connect(url?: string): Promise<WSDirectClient> {
        if (!this.url && !url) {
            throw new Error("The connection URL is missing.");
        }

        if (url) {
            this.url = url;
        }

        return new Promise((resolve: any, reject: any) => {
            try {
                this.client = new WSDirectClient({url: this.url, autoPublicate: false}, undefined, (c) => {
                    resolve(c);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public getAction<T>(actionName: string): T {
        const providers: any = this.client.getProviders();
        return providers[actionName] as T;
    }

    public getApi(): {[action: string]: { [method: string]: (...args: any[]) => Promise<any> }} {
        return this.client.getProviders();
    }
}
