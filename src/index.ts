export { APIManager } from './APIManager';
export { APIServer } from './APIServer';
export { APIClient } from './APIClient';
export { WSConfig } from './WSConfig';
export { WSResponse } from './WSResponse';
export { RestifyResponse } from './RestifyResponse';
export { RestifyServer } from './RestifyServer';
export { apiMethod } from './apiMethod';

export function getPublicPath() {
  return `${__dirname}/public`;
}
