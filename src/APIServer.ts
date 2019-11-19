import * as SocketIO from 'socket.io';

import { APIManager } from './APIManager';
import { WSConfig } from './WSConfig';

export class APIServer {

  private manager!: APIManager;
  private socket!: any;
  private config: WSConfig;
  private actions: { [key: string]: object } = {};
  private restifyServer!: any;

  constructor(config?: WSConfig | string, private port = 3500) {
    if (!config) {
      this.config = new WSConfig();
    } else if (typeof config === 'string') {
      this.config = new WSConfig({url: config});
    } else {
      this.config = config;
    }
  }

  public async run(server?: any) {
    this.socket = server;
    this.manager = new APIManager(this.config);
    this.manager.add(this.actions);
    const restServer = await this.initRestifyServer();
    if (restServer) {
      if (!this.socket) {
        this.socket = SocketIO.listen(restServer.server);
      } else {
        if (!this.socket.httpServer) {
          this.socket.attach(restServer.server);
        } else {
          throw new Error('HTTP server has already been added.');
        }
      }
      restServer.listen(this.port);
    }
    if (!this.socket) {
      this.socket = SocketIO.listen(this.port);
    }
    this.manager.setSocket(this.socket);
    this.manager.initListeners();
  }

  public getSocket(): any {
    return this.socket;
  }

  public getManager(): APIManager {
    return this.manager;
  }

  public add(actionName: string, action: object): void {
    this.actions[actionName] = action;
  }

  public getRestifyServer<T>(): T {
    return this.restifyServer as T;
  }

  private async initRestifyServer(): Promise<any> {
    const config = this.manager.getConfig();
    if (config.restifyServerOptions) {
      const { RestifyServer } = await import('./RestifyServer');
      const server = new RestifyServer(this.manager);
      this.restifyServer = server;
      return server.getServer();
    }
    return false;
  }
}
