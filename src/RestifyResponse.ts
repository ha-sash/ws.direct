import { Request, Response } from 'restify';

import { WSResponse } from './WSResponse';

export class RestifyResponse extends WSResponse {

  constructor(public api: any, public incomingMessage: any, public socket: any, public request: Request, public response: Response) {
    super(api, incomingMessage, socket);
  }

  public setCookie(): void {
    // empty
  }

  public send(): void {
    if (!this.isSent) {
      this.response.status(this.isSuccess() ? 200 : 500);
      this.response.header('content-type', 'json');
      this.response.send({
        result: this.getData(),
        success: this.isSuccess(),
        msg: this.getMessage(),
      });
      this.isSent = true;
    }
  }

}
