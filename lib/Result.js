class Result {

    constructor(api, msg, socket) {
        this.api = api;
        this.socket = socket;
        this.success = true;
        this.message = 'Ok';
        this.extra = {};
        this.wsMsg = msg;
    }

    isResult() {
        return true;
    }

    setData(_data) {
        this.data = _data;
        return this;
    }

    getData() {
        return this.data;
    }

    setMessage(_message) {
        this.message = _message;
        return this;
    }

    getMessage() {
        return this.message;
    }

    setSuccess(_success) {
        this.success = _success;
        return this;
    }

    isSuccess() {
        return this.success;
    }

    addParam(name, value) {
        this.extra[name] = value;
        return this;
    }

    getExtraParams() {
        return this.extra;
    }

    send() {
        this.api.sendResponse(this, this.wsMsg, this.getSocket());
    }

    setCookie() {
        let msg = this.wsMsg;
        if (typeof msg !== 'string') {
            msg = JSON.stringify(msg);
        }
        this.api.sendResponse(this, msg, this.getSocket(), this.api.setCookieEventName);
    }

    getSocket () {
        return this.socket;
    }

    getSession() {
        return this.socket.session;
    }
};

module.exports = Result;