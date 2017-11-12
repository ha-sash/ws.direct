"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const public_1 = require("../public");
class APIClient {
    constructor(url) {
        this.url = url;
        this.timeout = Infinity;
    }
    connect(url) {
        if (!this.url && !url) {
            throw new Error("The connection URL is missing.");
        }
        if (url) {
            this.url = url;
        }
        return new Promise((resolve, reject) => {
            try {
                this.client = new public_1.WSDirectClient({ url: this.url, autoPublicate: false }, undefined, (c) => {
                    resolve(c);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getActionTyped(actionName) {
        const providers = this.client.getProviders();
        return providers[actionName];
    }
    getAction(actionName) {
        const providers = this.client.getProviders();
        return providers[actionName];
    }
    getApi() {
        return this.client.getProviders();
    }
}
exports.APIClient = APIClient;
