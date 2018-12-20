"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable no-conditional-assignment */
function apiMethod(target, propertyKey, descriptor) {
    if (!target.hasOwnProperty("apiMethods")) {
        target.apiMethods = function () {
            let props = [];
            let obj = this;
            if (this.apiMethodsCache) {
                return this.apiMethodsCache;
            }
            this.apiMethodsCache = {};
            do {
                props = props.concat(Object.getOwnPropertyNames(obj));
            } while (obj = Object.getPrototypeOf(obj));
            for (const m of props) {
                if (this[m] && typeof this[m] === "function" && this[m].isApiMethod) {
                    this.apiMethodsCache[m] = true;
                }
            }
            return this.apiMethodsCache;
        };
    }
    target[propertyKey].isApiMethod = true;
}
exports.apiMethod = apiMethod;
