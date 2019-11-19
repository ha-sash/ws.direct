import { EventEmitter } from 'eventemitter3';
import { createServer, plugins, Request, Response, Server } from 'restify';

import { APIManager, Method } from './APIManager';
import { RestifyResponse } from './RestifyResponse';

export class RestifyServer extends EventEmitter {

  private server: any;
  private actions: { [action: string]: any } = {};

  constructor(private manager: APIManager) {
    super();
    this.server = createServer(manager.getConfig().restifyServerOptions);
    this.server.use(plugins.acceptParser(this.server.acceptable));
    this.server.use(plugins.queryParser());
    this.server.use(plugins.fullResponse());
    this.server.use(plugins.bodyParser());
    this.init();
  }

  public getServer(): Server {
    return this.server;
  }

  public async emitAsync(event: string, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any): Promise<boolean> {
    const all: Array<Promise<any>> = [];
    const me: any = this;

    if (!me._events[event]) {
      return false;
    }

    const listeners = me._events[event];
    const len = arguments.length;
    let args;
    let i: number;

    if (listeners.fn) {
      if (listeners.once) {
        this.removeListener(event, listeners.fn, undefined, true);
      }

      switch (len) {
        case 1:
          await listeners.fn.call(listeners.context);
          return true;
        case 2:
          await listeners.fn.call(listeners.context, a1);
          return true;
        case 3:
          await listeners.fn.call(listeners.context, a1, a2);
          return true;
        case 4:
          await listeners.fn.call(listeners.context, a1, a2, a3);
          return true;
        case 5:
          await listeners.fn.call(listeners.context, a1, a2, a3, a4);
          return true;
        case 6:
          await listeners.fn.call(listeners.context, a1, a2, a3, a4, a5);
          return true;
      }

      args = new Array(len - 1);
      for (i = 1; i < len; i += 1) {
        args[i - 1] = arguments[i];
      }

      all.push(listeners.fn.apply(listeners.context, args));
    } else {
      const length = listeners.length;
      let j;

      for (i = 0; i < length; i += 1) {
        if (listeners[i].once) {
          this.removeListener(event, listeners[i].fn, undefined, true);
        }

        switch (len) {
          case 1: listeners[i].fn.call(listeners[i].context); break;
          case 2: listeners[i].fn.call(listeners[i].context, a1); break;
          case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
          case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
          default:
            if (!args) {
              args = new Array(len - 1);
              for (j = 1; j < len; j += 1) {
                args[j - 1] = arguments[j];
              }
            }

            all.push(listeners[i].fn.apply(listeners[i].context, args));
        }
      }
    }

    await Promise.all(all);
    return true;
  }

  private init(): void {
    const actions = this.manager.getActions();
    for (const actionName of Object.keys(actions)) {
      const methods = this.manager.getMethods(actionName);
      this.initAction(actionName, methods);
    }
  }

  private initAction(actionName: string, methods: Method[]): void {
    const namespace = this.manager.namespace;
    this.actions[actionName] = {};
    for (const methodParams of methods) {
      this.actions[actionName][methodParams.method] = methodParams;
      const httpMethod = methodParams.httpMethod || 'post';
      const handler = this.createMethodHandler(actionName, methodParams);
      this.server[httpMethod](['', namespace, actionName, methodParams.method].join('/'), handler);
    }
  }

  private createMethodHandler(actionName: string, methodParams: Method): (req: Request, res: Response, next: () => void) => void {
    return async (req: Request, res: Response, next: () => void) => {
      await this.callApiMethod(actionName, methodParams, req, res);
      next();
    };
  }

  private getArguments(methodParams: Method, req: Request): any[] {
    const queryParams = req.query;
    let resultParams: any = {};
    switch (methodParams.httpMethod) {
      default:
        resultParams = {...queryParams, ...req.body};
    }
    return methodParams.arguments.map((paramName) => {
      if (resultParams.hasOwnProperty(paramName)) {
        return resultParams[paramName];
      }
      throw new Error(`Parameter ${paramName} not found`);
    });
  }

  private createIncomingMessageStub(actionName: string, methodName: string, req: Request) {
    return {
      event: this.manager.callEventName,
      action: actionName,
      method: methodName,
      httpRequest: req,
    };
  }

  private async callApiMethod(actionName: string, methodParams: Method, req: Request, res: Response) {
    const api = this.actions[actionName];
    const methodName = methodParams.method;
    const response = new RestifyResponse(
      api,
      this.createIncomingMessageStub(actionName, methodName, req),
      {},
      req,
      res,
    );
    try {
      const args = this.getArguments(methodParams, req);
      await this.emitAsync('beforeCall', response, args);
      const action = this.manager.getActions()[actionName];
      const callResult = await action[methodName]
        .apply(action, args.concat(response));

      response.setData(callResult);
      this.emitAsync('beforeSendResult', response, args);
      response.send();
      this.emit('afterSendResult', response, args);

    } catch (e) {
      response.setSuccess(false)
        .addParam('stack', e.stack || '')
        .setMessage(e.message);
      this.emitAsync('beforeSendError', response);
      response.send();
      this.emit('afterSendError', response);
    }
  }
}
