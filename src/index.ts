export { APIManager } from './APIManager';
export { APIServer } from './APIServer';
export { APIClient } from './APIClient';
export { WSConfig } from './WSConfig';
export { WSResponse } from './WSResponse';
export { apiMethod } from './apiMethod';
export * from './utils/logs';

export function getPublicPath() {
  return `${__dirname}/public`;
}
