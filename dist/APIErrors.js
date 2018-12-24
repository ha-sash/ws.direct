"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCallMsgIdNotFound = {
    type: 'global_error',
    msg: 'Not found api call id.',
};
exports.apiCallMsgActionNotFound = {
    type: 'global_error',
    msg: 'Action {action} is not found.',
};
exports.apiCallActionObjectNotFound = {
    type: 'global_error',
    msg: 'Not found action object by action name {action}.',
};
exports.apiCallMsgMethodNotFound = {
    type: 'global_error',
    msg: 'Not found api call method.',
};
exports.apiCallMethodNotFoundInObject = {
    type: 'global_error',
    msg: 'Not found action method by method name {method} in action {action}.',
};
exports.apiCallMsgArgsNotFound = {
    type: 'global_error',
    msg: 'Not found api call args.',
};
exports.apiCallMsgArgsIsNotArray = {
    type: 'global_error',
    msg: 'Not valid api call args for action {action} and method {method}.',
};
