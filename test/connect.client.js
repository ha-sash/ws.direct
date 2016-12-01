const assert = require('assert'),
    APIManager = require('../').APIManager,
    socketio = require('socket.io'),
    WSDirectClient = require('../public/ws.direct.client'),
    port = 8811;

global.io = require('socket.io-client');
let xxx = class {

    notPublicMethod() {}

    publucMethod(x, y, result) {
        if (result.isResult()) {
            result.setData(x + y);
            result.setMessage('SUPER');
            result.send();
        }
    }

    publucMethodException(result) {
            throw new Error('Some error');
    }

    apiMethods() {
        return {publucMethod: true, publucMethodException: true};
    }
};

describe('Test client', () => {

    let api;

    before(() => {
        let skio = socketio.listen(port), xxxObject = new xxx();
        api = new APIManager(skio, {url: `http://localhost:${port}`});
        api.add('xxxAction', xxxObject);
    });

    it('Connect client', (done) => {
        eval(api.getScript());
        wsdirect.$APIManager.getSocket().on('connect', () => {
            done();
        });
    });

    it('Check public remote method', () => {
        assert.ok(wsdirect.xxxAction.publucMethod instanceof Function);
    });

    it('Check not public remote method', () => {
        assert.ok(wsdirect.xxxAction.notPublicMethod === undefined);
    });



    it('Call public remote method with exception', (done) => {
        wsdirect.xxxAction.publucMethodException((res, e) => {
            assert.ok(!e.success);
            assert.ok(e.msg == 'Some error');
            done();
        });
    });

    it('Call public remote method', (done) => {
        wsdirect.xxxAction.publucMethod(5, 3, (res, e) => {
            assert.ok(e.success);
            assert.ok(res === 8);
            done();
        });
    });

    it('Demo test', () => {

        var SomePublicAPI = class {

            notPublicMethod() {}

            publucMethod(x, y, result) {
                if (result.isResult()) {
                    result.setData(x + y);
                    result.setMessage('SUPER');
                    result.send();
                }
            }

            publucMethodException(result) {
                    throw new Error('Some error');
            }

            apiMethods() {
                return {publucMethod: true, publucMethodException: true};
            }
        };

        api.add('PubAPI', new SomePublicAPI);
        var clientInitScript = api.getScript();
        //console.log(clientInitScript, 'jopo');
    });

});