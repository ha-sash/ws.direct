"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicPath = exports.apiMethod = exports.WSResponse = exports.WSConfig = exports.APIClient = exports.APIServer = exports.APIManager = void 0;
var APIManager_1 = require("./APIManager");
Object.defineProperty(exports, "APIManager", { enumerable: true, get: function () { return APIManager_1.APIManager; } });
var APIServer_1 = require("./APIServer");
Object.defineProperty(exports, "APIServer", { enumerable: true, get: function () { return APIServer_1.APIServer; } });
var APIClient_1 = require("./APIClient");
Object.defineProperty(exports, "APIClient", { enumerable: true, get: function () { return APIClient_1.APIClient; } });
var WSConfig_1 = require("./WSConfig");
Object.defineProperty(exports, "WSConfig", { enumerable: true, get: function () { return WSConfig_1.WSConfig; } });
var WSResponse_1 = require("./WSResponse");
Object.defineProperty(exports, "WSResponse", { enumerable: true, get: function () { return WSResponse_1.WSResponse; } });
var apiMethod_1 = require("./apiMethod");
Object.defineProperty(exports, "apiMethod", { enumerable: true, get: function () { return apiMethod_1.apiMethod; } });
__exportStar(require("./utils/logs"), exports);
function getPublicPath() {
    return `${__dirname}/public`;
}
exports.getPublicPath = getPublicPath;
