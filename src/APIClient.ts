import { WSDirectClient } from '../public';

export class APIClient {

  public timeout = Infinity;
  private client!: WSDirectClient;
  private inited = false;
  private initedTask: Array<() => void> = [];

  constructor(private url?: string) {
  }

  public connect(url?: string): Promise<WSDirectClient> {
    if (!this.url && !url) {
      throw new Error('The connection URL is missing.');
    }

    if (url) {
      this.url = url;
    }

    return new Promise((resolve: any, reject: any) => {
      try {
        this.client = new WSDirectClient({url: this.url, autoPublish: false}, undefined, (c) => {
          resolve(c);
          this.onInited();
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public getAction<T>(actionName: string): Promise<T> {
    return new Promise((resolve: any, reject: any) => {
      const get = () => {
        const providers: any = this.client.getProviders();
        resolve(providers[actionName] as T);
      };
      if (!this.inited) {
        this.initedTask.push(get);
      } else {
        get();
      }
    });
  }

  public getActionSync<T>(actionName: string): T {
    const providers: any = this.client.getProviders();
    return providers[actionName] as T;
  }

  public getApi(): { [action: string]: { [method: string]: (...args: any[]) => Promise<any> } } {
    return this.client.getProviders();
  }

  private onInited() {
    this.inited = true;
    for (const task of this.initedTask) {
      if (typeof task === 'function') {
        task();
      }
    }
  }
}
