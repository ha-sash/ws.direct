"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = void 0;
const public_1 = require("../public");
class APIClient {
    constructor(url) {
        this.url = url;
        this.timeout = Infinity;
        this.inited = false;
        this.initedTask = [];
    }
    connect(url) {
        if (!this.url && !url) {
            throw new Error('The connection URL is missing.');
        }
        if (url) {
            this.url = url;
        }
        return new Promise((resolve, reject) => {
            try {
                this.client = new public_1.WSDirectClient({
                    url: this.url,
                    autoPublish: false
                }, undefined, (c) => {
                    resolve(c);
                    this.onInited();
                }, reject);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getAction(actionName) {
        return new Promise((resolve, reject) => {
            const get = () => {
                const providers = this.client.getProviders();
                resolve(providers[actionName]);
            };
            if (!this.inited) {
                this.initedTask.push(get);
            }
            else {
                get();
            }
        });
    }
    getActionSync(actionName) {
        const providers = this.client.getProviders();
        return providers[actionName];
    }
    getApi() {
        return this.client.getProviders();
    }
    onInited() {
        this.inited = true;
        for (const task of this.initedTask) {
            if (typeof task === 'function') {
                task();
            }
        }
    }
}
exports.APIClient = APIClient;
