import { EventEmitter } from 'events';
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
      } else {
        throw new Error(`Parameter ${paramName} not found`);
      }
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
      this.emit('beforeCall', response, args);
      const action = this.manager.getActions()[actionName];
      const callResult = await action[methodName]
        .apply(action, args.concat(response));

      response.setData(callResult);
      this.emit('beforeSendResult', response, args);
      response.send();
      this.emit('afterSendResult', response, args);

    } catch (e) {
      response.setSuccess(false)
        .addParam('stack', e.stack || '')
        .setMessage(e.message);
      this.emit('beforeSendError', response);
      response.send();
      this.emit('afterSendError', response);
    }
  }
}
