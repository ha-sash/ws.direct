const assert = require('assert'),
    APIManager = require('../').APIManager,
    socketio = require('socket.io'),
    socketioClient = require('socket.io-client'),
    WSDirectClient = require('../public/ws.direct.client'),
    port = 8811;

let xxx = class {

    notPublicMethod() {}

    publicMethod(x, y, result) {
        if (result.isResult()) {
            result.setData(x + y);
            result.setMessage('SUPER');
            result.send();
        }
    }

    publicMethodAutoSendResult(x, y, result) {
        if (result.isResult()) {
            return x + y
        }
    }

    async publicAsyncMethodAutoSendResult(x, y, result) {
        if (result.isResult()) {
            return x + y
        }
    }

    publicMethodException(result) {
            throw new Error('Some error');
    }

    apiMethods() {
        return {
            publicMethod: true,
            publicMethodException: true,
            publicMethodAutoSendResult: true,
            publicAsyncMethodAutoSendResult: true
        };
    }
};

describe('Test simple connection client', () => {
    let api, skio;

    before(() => {
        skio = socketio.listen(port), xxxObject = new xxx();
        api = new APIManager(skio, {url: `http://localhost:${port}`, namespace: 'wsdirectsimple'});
        api.add('xxxAction', xxxObject);
    });

    after(()=> {
        skio.close();
    });

    it('Simple connect client', (done) => {
        var WSDClient = new WSDirectClient(`http://localhost:${port}`, socketioClient);
        WSDClient.onInit = function() {
            if (wsdirectsimple !== undefined) {
                done();
            }
        }
    });
});

describe('Test client', () => {

    let api, skio;

    before(() => {
        skio = socketio.listen(port), xxxObject = new xxx();
        api = new APIManager(skio, {url: `http://localhost:${port}`});
        api.add('xxxAction', xxxObject);
    });

    after(()=> {
        skio.close();
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
            assert.ok(e.message == 'Some error');
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

    it('Call public remote method with promise and auto send result', async () => {
        const result = await wsdirect.xxxAction.publicMethodAutoSendResult(5, 4);
        assert.equal(result, 9);
    });

    it('Call public remote async method with promise and auto send result', async () => {
        const result = await wsdirect.xxxAction.publicAsyncMethodAutoSendResult(5, 4);
        assert.equal(result, 9);
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

