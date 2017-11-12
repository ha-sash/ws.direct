import * as SocketIO from "socket.io";

export class WSResponse {

    public data: any;
    public success = true;
    public message = "Ok";
    public extra: {[k: string]: any} = {};
    public isSent = false;

    constructor(public api: any, public incomingMessage: any, public socket: SocketIO.Socket) {}

    public isResult(): true {
        return true;
    }

    public setData(data: any): this {
        this.data = data;
        return this;
    }

    public getData(): any {
        return this.data;
    }

    public setMessage(message: string): this {
        this.message = message;
        return this;
    }

    public getMessage(): string {
        return this.message;
    }

    public setSuccess(success: boolean): this {
        this.success = success;
        return this;
    }

    public isSuccess(): boolean {
        return this.success;
    }

    public addParam(name: string, value: any): this {
        this.extra[name] = value;
        return this;
    }

    public getExtraParams(): {[k: string]: any} {
        return this.extra;
    }

    public send(): void {
        if (!this.isSent) {
            this.api.sendResponse(this, this.incomingMessage, this.getSocket());
            this.isSent = true;
        }
    }

    public setCookie() {
        let msg = this.incomingMessage;
        if (typeof msg !== "string") {
            msg = JSON.stringify(msg);
        }
        this.api.sendResponse(this, msg, this.getSocket(), this.api.config.setCookieEventName);
    }

    public getSocket(): SocketIO.Socket {
        return this.socket;
    }

    public getSession(): any {
        return (this.socket as any).session;
    }

}
