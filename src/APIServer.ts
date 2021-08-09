import { Server } from 'socket.io';

import { APIManager } from './APIManager';
import { WSConfig } from './WSConfig';

export class APIServer {

  private manager!: APIManager;
  private socket!: any;
  private readonly config: WSConfig;
  private actions: { [key: string]: object } = {};

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

    if (!this.socket) {
      const srv = new Server({
        cors: {
          origin: this.config.url,
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });
      this.socket = srv.listen(this.port);
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

}
