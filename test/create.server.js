const assert = require('assert'),
      APIManager = require('../').APIManager,
      socketio = require('socket.io');

describe('Create APIManager object', () => {

    it('Create api without socket.io object', () => {
        assert.throws(() => {
            let api = new APIManager();
            },
            'API cannot be created without a socket.io server'
        );
    });

    it('Create api with default settings', () => {
        let io = socketio();
        let api = new APIManager(io);

        assert.ok(api instanceof APIManager, "Failed to create API");

        assert.equal(api.url, 'http://localhost:3000/');
        assert.equal(api.io, io);
        assert.equal(api.sessionCookieName, 'connect.sid');
        assert.equal(api.sessionSecret, '');
        assert.equal(api.browserSocketVariableName, null);
        assert.equal(api.responseEventName, 'api:response');
        assert.equal(api.errorEventName, 'api:error');
        assert.equal(api.callEventName, 'api:call');
        assert.equal(api.namespace, 'wsdirect');
    });

    it('Create api with custom settings', () => {
        let io = socketio();
        let api = new APIManager(io, {
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

        assert.ok(api instanceof APIManager, "Failed to create API");

        assert.equal(api.url, 'test1');
        assert.equal(api.io, io);
        assert.equal(api.sessionCookieName, 'test2');
        assert.equal(api.sessionSecret, 'test3');
        assert.equal(api.browserSocketVariableName, 'test4');
        assert.equal(api.responseEventName, 'test5');
        assert.equal(api.errorEventName, 'test6');
        assert.equal(api.callEventName, 'test7');
        assert.equal(api.namespace, 'test8');
    });

    it('Add object to API', () => {
        let io = socketio();
        let api = new APIManager(io);

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
        assert.deepEqual(api.getMethods('xxxAction'), [ { method: 'publicMethod', arguments: [ 'x', 'y' ] } ]);
    });

});