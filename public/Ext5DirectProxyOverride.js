Ext.define('Ext5DirectProxyOverride', {
    override: 'Ext.data.proxy.Direct',
    
    resolveMethods: function() {
        var me = this,
            fn = me.getDirectFn(),
            api = me.getApi(),
            Manager = Ext.direct.Manager,
            method;

        if (fn) {
            me.setDirectFn(method = Manager.parseMethod(fn));

            if (!Ext.isFunction(method)) {
                Ext.Error.raise('Cannot resolve directFn ' + fn);
            }
        }

        if (api) {
            var trueFn = function(){return true;}, 
                oneFn = function() {return 1;};
            
            for (fn in api) {
                if (api.hasOwnProperty(fn)) {
                    method = api[fn];
                    api[fn] = Manager.parseMethod(method);
                    
                    if (!api[fn].hasOwnProperty('directCfg')) {
                        api[fn].directCfg = {
                            method: {
                                getArgs: Ext.create('Ext.direct.RemotingMethod', {len: 1, params: {}}).getArgs,
                                getLen: oneFn,
                                getOrdered: trueFn
                            }
                        };
                    }

                    if (!Ext.isFunction(api[fn])) {
                        Ext.Error.raise('Cannot resolve Direct api ' + fn + ' method ' + method);
                    }
                }
            }
        }

        me.methodsResolved = true;
    },
    
    createRequestCallback: function(request, operation){
        var me = this;

        return function(data, event){
            if (event.hasOwnProperty('success')) {
                event.status = event.success;
            }
            
            if (!event.hasOwnProperty('result') || !event.result) {
                event.result = {};
            }
            
            if (event.hasOwnProperty('total')) {
                event.result.total = event.total;
            }
            
            //if (event.hasOwnProperty('result') && event.result.hasOwnProperty('total')) {}
            me.processResponse(event.status, operation, request, event);
        };
    }
    
});