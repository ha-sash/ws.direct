import type { ServerOptions } from 'socket.io';

export class WSConfig {

  public url = 'http://localhost:3000/';
  public sessionSecret = '';
  public sessionCookieName = 'connect.sid';
  public browserSocketVariableName = null;
  public responseEventName = 'api:response';
  public setCookieEventName = 'api:setcookie';
  public errorEventName = 'api:error';
  public callEventName = 'api:call';
  public initEventName = 'api:init';
  public namespace = 'wsdirect';
  public serverOptions?: ServerOptions;

  constructor(cfg: any = {}) {
    Object.assign(this, cfg);
  }

}
