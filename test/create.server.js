const assert = require('assert'),
  APIManager = require('../').APIManager,
  APIServer = require('../').APIServer,
  socketio = require('socket.io');

describe('Create APIManager object', () => {

  it('Create api without socket.io object', () => {
    assert.throws(() => {
        let api = new APIServer();
        apu.run();
      },
      'API cannot be created without a socket.io server'
    );
  });

  it('Create api with default settings', async () => {
    let io = socketio();
    let api = new APIServer();
    await api.run(io);

    const manager = api.getManager();

    assert.ok(manager instanceof APIManager, "Failed to create API");
    assert.strictEqual(manager.url, 'http://localhost:3000/');
    assert.strictEqual(manager.io, io);
    assert.strictEqual(manager.sessionCookieName, 'connect.sid');
    assert.strictEqual(manager.sessionSecret, '');
    assert.strictEqual(manager.browserSocketVariableName, null);
    assert.strictEqual(manager.responseEventName, 'api:response');
    assert.strictEqual(manager.errorEventName, 'api:error');
    assert.strictEqual(manager.callEventName, 'api:call');
    assert.strictEqual(manager.namespace, 'wsdirect');
  });

  it('Create api with custom settings', async () => {
    let io = socketio();
    let api = new APIServer({
      io: 'jopo',
      url: 'test1',
      sessionCookieName: 'test2',
      sessionSecret: 'test3',
      browserSocketVariableName: 'test4',
      responseEventName: 'test5',
      errorEventName: 'test6',
      callEventName: 'test7',
      namespace: 'test8'
    });
    await api.run(io);
    const manager = api.getManager();

    assert.ok(manager instanceof APIManager, "Failed to create API");

    assert.strictEqual(manager.url, 'test1');
    assert.strictEqual(manager.io, io);
    assert.strictEqual(manager.sessionCookieName, 'test2');
    assert.strictEqual(manager.sessionSecret, 'test3');
    assert.strictEqual(manager.browserSocketVariableName, 'test4');
    assert.strictEqual(manager.responseEventName, 'test5');
    assert.strictEqual(manager.errorEventName, 'test6');
    assert.strictEqual(manager.callEventName, 'test7');
    assert.strictEqual(manager.namespace, 'test8');
  });

  it('Add object to API', () => {
    let io = socketio();
    let api = new APIManager(io);
    api.initListeners();

    let xxx = class {

      publicMethod(x, y, result) {
        if (result.isResult()) {
          result.setData(x + y);
          result.send();
        }
      }

      apiMethods() {
        return {publicMethod: true};
      }
    }
    let xxxObject = new xxx();
    api.add('xxxAction', xxxObject);
    assert.deepStrictEqual(api.getMethods('xxxAction'), [{method: 'publicMethod', arguments: ['x', 'y']}]);
  });

});