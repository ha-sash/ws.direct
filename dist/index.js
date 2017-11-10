"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APIManager_1 = require("./APIManager");
exports.APIManager = APIManager_1.APIManager;
var APIServer_1 = require("./APIServer");
exports.APIServer = APIServer_1.APIServer;
var APIClient_1 = require("./APIClient");
exports.APIClient = APIClient_1.APIClient;
var WSConfig_1 = require("./WSConfig");
exports.WSConfig = WSConfig_1.WSConfig;
var WSResponse_1 = require("./WSResponse");
exports.WSResponse = WSResponse_1.WSResponse;
var apiMethod_1 = require("./apiMethod");
exports.apiMethod = apiMethod_1.apiMethod;
function getPublicPath() {
    return `${__dirname}/public`;
}
exports.getPublicPath = getPublicPath;
