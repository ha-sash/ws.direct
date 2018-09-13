Ext.define('Ext.data.proxy.Functions', {
  extend: 'Ext.data.proxy.Direct',
  alias: 'proxy.functions',
  extractResponseData: function(event) {
    var me = this,
        rootProperty = me.getReader().getRootProperty();
    if (!rootProperty) {
      return event.result
    } else {
      return event.result[rootProperty];
    }
  },

  createRequestCallback: function(request, operation) {
    var me = this;

    return function(data, event) {
      if (!me.canceledOperations[operation.id]) {
        me.processResponse(event.success, operation, request, event);
      }
      delete me.canceledOperations[operation.id];
    };
  },

  doRequest: function(operation) {
    var me = this,
      writer, request, action, params, api, fn;

    if (!me.methodsResolved) {
      me.resolveMethods();
    }

    request = me.buildRequest(operation);
    action  = request.getAction();
    api     = me.getApi();

    if (api) {
      fn = api[action];
    }

    fn = fn || me.getDirectFn();

    writer = me.getWriter();

    if (writer && operation.allowWrite()) {
      request = writer.write(request);
    }

    if (action === 'read') {
      params = request.getParams();
    }
    else {
      params = request.getJsonData();
    }
    
    fn.apply(window, [params, me.createRequestCallback(request, operation)]);
    return request;
  }
});