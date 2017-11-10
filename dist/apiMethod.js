"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function apiMethod(target, propertyKey, descriptor) {
    if (!target.hasOwnProperty("___apiMethodList")) {
        target.___apiMethodList = {};
    }
    if (!target.hasOwnProperty("apiMethods")) {
        target.apiMethods = () => {
            return target.___apiMethodList;
        };
    }
    target.___apiMethodList[propertyKey] = true;
}
exports.apiMethod = apiMethod;
