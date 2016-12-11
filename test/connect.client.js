const assert = require('assert'),
    APIManager = require('../').APIManager,
    socketio = require('socket.io'),
    WSDirectClient = require('../public/ws.direct.client'),
    port = 8811;

global.io = require('socket.io-client');
let xxx = class {

    notPublicMethod() {}

    publicMethod(x, y, result) {
        if (result.isResult()) {
            result.setData(x + y);
            result.setMessage('SUPER');
            result.send();
        }
    }

    publicMethodException(result) {
            throw new Error('Some error');
    }

    apiMethods() {
        return {publicMethod: true, publicMethodException: true};
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
        assert.ok(wsdirect.xxxAction.publicMethod instanceof Function);
    });

    it('Check not public remote method', () => {
        assert.ok(wsdirect.xxxAction.notPublicMethod === undefined);
    });



    it('Call public remote method with exception', (done) => {
        wsdirect.xxxAction.publicMethodException((res, e) => {
            assert.ok(!e.success);
            assert.ok(e.msg == 'Some error');
            done();
        });
    });

    it('Call public remote method', (done) => {
        wsdirect.xxxAction.publicMethod(5, 3, (res, e) => {
            assert.ok(e.success);
            assert.ok(res === 8);
            done();
        });
    });

    it('Call public remote method with promise', (done) => {
        wsdirect.xxxAction.publicMethod(5, 4).then(res => {
            assert.ok(res === 9);
            done();
        });
    });

    it('Call public remote method with exception with promise', (done) => {
        wsdirect.xxxAction.publicMethodException().then(() => {
            assert.ok(false);
        }).catch(e => {
            assert.ok(!e.success);
            assert.ok(e.msg == 'Some error');
            done();
        });
    });

    it('Subscribe to the execution result', (done) => {
        let callCounter = 0;

        wsdirect.xxxAction.publicMethod.on('response', (result, event, client) => {
            callCounter++;

            if (callCounter === 3) {
                assert.ok(true);
                done();
            }
        });

        wsdirect.xxxAction.publicMethod(1,2);
        wsdirect.xxxAction.publicMethod(3,4);
        wsdirect.xxxAction.publicMethod(5,6);
    });



    /*
    it('Demo test', () => {

        var SomePublicAPI = class {

            notPublicMethod() {}

            publicMethod(x, y, result) {
                if (result.isResult()) {
                    result.setData(x + y);
                    result.setMessage('SUPER');
                    result.send();
                }
            }

            publicMethodException(result) {
                    throw new Error('Some error');
            }

            apiMethods() {
                return {publicMethod: true, publicMethodException: true};
            }
        };

        api.add('PubAPI', new SomePublicAPI);
        var clientInitScript = api.getScript();
        //console.log(clientInitScript, 'jopo');
    });
    */

});