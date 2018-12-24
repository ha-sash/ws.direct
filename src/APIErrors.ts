export const apiCallMsgIdNotFound = {
  type: 'global_error',
  msg: 'Not found api call id.',
};

export const apiCallMsgActionNotFound = {
  type: 'global_error',
  msg: 'Action {action} is not found.',
};

export const apiCallActionObjectNotFound = {
  type: 'global_error',
  msg: 'Not found action object by action name {action}.',
};

export const apiCallMsgMethodNotFound = {
  type: 'global_error',
  msg: 'Not found api call method.',
};

export const apiCallMethodNotFoundInObject = {
  type: 'global_error',
  msg: 'Not found action method by method name {method} in action {action}.',
};

export const apiCallMsgArgsNotFound = {
  type: 'global_error',
  msg: 'Not found api call args.',
};

export const apiCallMsgArgsIsNotArray = {
  type: 'global_error',
  msg: 'Not valid api call args for action {action} and method {method}.',
};
