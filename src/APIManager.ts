/* tslint:disable no-parameter-reassignment */
import { Server, Socket } from 'socket.io';
import * as APIError from './APIErrors';
import { WSConfig } from './WSConfig';
import { WSResponse } from './WSResponse';

export interface Method {
  method: string;
  arguments: string[];
  httpMethod?: string;
}

export class APIManager {

  public io?: Server;
  public config: WSConfig;
  public actions: { [action: string]: any } = {};
  public resultObject = WSResponse;
  private apiConfigCache: any;
  private errors: { [k: string]: any } = APIError;

  public get url() {
    return this.config.url;
  }

  public get sessionSecret() {
    return this.config.sessionSecret;
  }

  public get sessionCookieName() {
    return this.config.sessionCookieName;
  }

  public get browserSocketVariableName() {
    return this.config.browserSocketVariableName;
  }

  public get responseEventName() {
    return this.config.responseEventName;
  }

  public get setCookieEventName() {
    return this.config.setCookieEventName;
  }

  public get errorEventName() {
    return this.config.errorEventName;
  }

  public get callEventName() {
    return this.config.callEventName;
  }

  public get initEventName() {
    return this.config.initEventName;
  }

  public get namespace() {
    return this.config.namespace;
  }

  constructor(config: any = {}) {
    this.config = new WSConfig(config);
  }

  public setSocket(socket: Server) {
    this.io = socket;
  }

  public initListeners(): void {
    if (this.io) {
      this.io.sockets.on('connection', (socket: any) => {
        socket.on('message', (incomingMessage: any) => {
          this.onMessage(incomingMessage, socket);
        });
      });
    }
  }

  public add(actionName: any, object?: any): void {
    if (actionName instanceof Object && object === undefined) {
      for (const i in actionName) {
        if (actionName.hasOwnProperty(i)) {
          this.add(i, actionName[i]);
        }
      }
    } else if (this.actions[actionName] === undefined && object !== undefined && object instanceof Object) {
      if (object.apiMethods === undefined || typeof object.apiMethods !== 'function') {
        throw new Error(`API ('${actionName}) object has to have a method "apiMethods"`);
      }
      this.actions[actionName] = object;
    }
  }

  public getActions(): { [action: string]: any } {
    return this.actions;
  }

  public sendResponse(response: WSResponse, incomingMessage: any, socket: any, eventName: string): void {
    const result = {
      event: eventName || this.config.responseEventName,
      id: incomingMessage.id,
      result: response.getData(),
      success: response.isSuccess(),
      msg: response.getMessage(),
    };

    socket.json.send({...response.getExtraParams(), ...result});
  }

  public sendError(err: any, incomingMessage: any, socket: any) {
    let msg: any = {};
    if (err instanceof Object) {
      msg = err;
    } else if (typeof err === 'string' && this.errors[err]) {
      const tmpl = this.errors[err];
      let text = tmpl.msg;

      for (const i in msg) {
        if (msg.hasOwnProperty(i)) {
          text = text.replace(`{${i}`, msg[i]);
        }
      }

      msg = {
        type: tmpl.type,
        msg: tmpl.msg,
        code: err,
      };
    }

    msg.id = incomingMessage.id;
    socket.json.send(msg);
  }

  public getScript() {
    const script = [];
    script.push(
      '(function() {',
      'var WSDClient = new WSDirectClient(',
      JSON.stringify(this.getApiConfig()),
      this.browserSocketVariableName === null ? '' : `, ${this.browserSocketVariableName}`,
      ');',
      '})();',
    );

    return script.join('');
  }

  public getConfig(): WSConfig {
    return this.config;
  }

  public getMethods(action: any): Method[] {
    const methods: Method[] = [];
    let publicMethods: { [k: string]: boolean };

    if (typeof action === 'string') {
      action = this.actions[action];
    }

    publicMethods = action.apiMethods();

    for (const methodName in publicMethods) {
      if (publicMethods[methodName] && action[methodName] instanceof Function) {
        const args = this.getArtuments(action[methodName]);
        methods.push({
          method: methodName,
          arguments: args.slice(0, args.length - 1),
        });
      }
    }

    return methods;
  }

  private validateMessage(incomingMessage: any, socket: Socket): boolean {
    let result = false;
    let err: string | false = false;

    if (incomingMessage.id === undefined) {
      err = 'apiCallMsgIdNotFound';
    } else if (incomingMessage.action === undefined) {
      err = 'apiCallMsgActionNotFound';
    } else if (this.actions[incomingMessage.action] === undefined) {
      err = 'apiCallActionObjectNotFound';
    } else if (incomingMessage.method === undefined) {
      err = 'apiCallMsgMethodNotFound';
    } else if (incomingMessage.args === undefined) {
      err = 'apiCallMsgArgsNotFound';
    } else if (!Array.isArray(incomingMessage.args)) {
      err = 'apiCallMsgArgsIsNotArray';
    } else if (!this.isExistsActionMethod(incomingMessage.action, incomingMessage.method)) {
      err = 'apiCallMethodNotFoundInObject';
    } else {
      result = true;
    }

    if (err) {
      this.sendError(err, incomingMessage, socket);
    }

    return result;
  }

  private isExistsActionMethod(actionName: string, methodName: string): boolean {
    const action = this.actions[actionName];

    if (!action) {
      return false;
    }

    if (!action.apiMethods()
      .hasOwnProperty(methodName)) {
      return false;
    }

    return typeof action[methodName] === 'function';
  }

  private onMessage(incomingMessage: any, socket: Socket) {
    if (incomingMessage.event == this.config.callEventName) {
      if (this.validateMessage(incomingMessage, socket)) {
        const api = this.actions[incomingMessage.action];
        const result = this.createResponse(incomingMessage, socket);

        try {
          const callResult = api[incomingMessage.method].apply(api, incomingMessage.args.concat(result));

          if (callResult instanceof Promise) {
            callResult.then((data) => {
              result.setData(data)
                .send();
            })
              .catch((e) => {
                result.setSuccess(false)
                  .addParam('stack', e.stack || '')
                  .setMessage(e.message)
                  .send();
              });
          } else {
            if (!result.isSent) {
              result.setData(callResult)
                .send();
            }
          }

        } catch (e) {
          result.setSuccess(false)
            .addParam('stack', e.stack || '')
            .setMessage(e.message)
            .send();
        }
      }
    } else if (incomingMessage.event == this.config.initEventName) {
      if (!this.apiConfigCache) {
        this.apiConfigCache = this.getApiConfig();
      }
      socket.json.send({event: this.config.initEventName, config: this.apiConfigCache});
    }
  }

  private createResponse(incomingMessage: any, socket: Socket): WSResponse {
    return new this.resultObject(this, incomingMessage, socket);
  }

  private getApiConfig(): any {
    const result: any = {
      namespace: this.config.namespace,
      url: this.config.url,
      calleventname: this.config.callEventName,
      responseeventname: this.config.responseEventName,
      erroreventname: this.config.errorEventName,
      actions: {},
    };

    for (const i in this.actions) {
      if (this.actions.hasOwnProperty(i)) {
        result.actions[i] = this.getMethods(this.actions[i]);
      }
    }

    return result;
  }

  private getArtuments(fn: any): string[] {
    const strFn = fn.toString()
      .replace(/^async /i, '');
    const fnHeader = strFn.match(/^[a-z0-9_]+(?:\s|)\((.*?)\)/gi);

    if (fnHeader && fnHeader[0]) {
      if (fnHeader[0].indexOf('=') !== -1) {
        throw new Error('Default values are not supported');
      }
      return fnHeader[0].replace(/^[a-z0-9_]+(?:\s|)\(/gi, '')
        .replace(/\)/g, '')
        .split(', ');
    }

    return [];
  }

}
