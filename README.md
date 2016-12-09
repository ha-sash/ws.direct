# WS.Direct
Simple RPC works through Socket.io. Allows you will get access to objects on the server.
The library is made by analogy, ext.direct. If you use override for direct.proxy, you can use the api instead of ext.direct by http.

## Requirements
 - [nodejs](http://nodejs.org)
 - [npm](http://npmjs.org)
 - [socket.io](http://socket.io)


## Installation
    npm install ws.direct

## Example

Creating simple server
```javascript

const wsdirect = require('ws.direct'),
      APIManager = wsdirect.APIManager,
      port = 8811,
      socketio = require('socket.io').listen(port);

var api = new APIManager(socketio, {url: `http://localhost:${port}`}); //URL need for client to know where to connect 

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

    //Example API for ExtJs GridPanel:
    getListOfCharacters(params, result) {
        if (result.isResult()) {
            result.setData([
                { name: 'Eddie Valiant'},
                { name: 'Roger Rabbit'},
                { name: 'Jessica Rabbit'},
                { name: 'Judge Doom'},
                { name: 'Baby Herman'},
                { name: 'Benny the Cab'},
                { name: 'Dolores'},
                { name: 'R.K. Maroon'},
                { name: 'Marvin Acme'},
                { name: 'Lt. Santino'},
                { name: 'Teddy Valiant'},
                { name: 'Angelo'},
                { name: 'Bongo the Gorilla'},
                { name: 'Lena Hyena'},
                { name: 'Toon Bullets'}
            ]).send();
        }
    }

    apiMethods() {
        return {publicMethod: true, publicMethodException: true, getListOfCharacters: true};
    }
};

api.add('PubAPI', new SomePublicAPI);

//ClientInitScript variable will contain the client script. It can be performed on the browser side in any convenient way.
var clientInitScript = api.getScript();




//for example:
var http = require('http');
var server = http.createServer(function (req, res) {
    var fs = require('fs');
    var alias = {
        '/socket.io/socket.io.js': `${__dirname}/node_modules/socket.io-client/dist/socket.io.js`,
        '/ws.direct.client.js': wsdirect.getPublicPath() + '/ws.direct.client.js',
        '/': `${__dirname}/index.html`
    };

    if (alias.hasOwnProperty(req.url)) {
        fs.readFile(alias[req.url], (e, d) => {
            res.end(d);
        });
    } else {
        res.end(clientInitScript);
    }

});

server.listen(3500);
 
```

index.html
```html

<html>
    <head>
        <script src="http://localhost:3500/socket.io/socket.io.js"></script>
        <script src="http://localhost:3500/ws.direct.client.js"></script>
        <script src="http://localhost:3500/initMyAPI.js"></script>
        <script>
            wsdirect.PubAPI.publicMethod(2, 3, function(res, event) {
                if (event.success) {
                    document.getElementById('result').innerHTML = `Result: ${res}`;
                } else {
                    document.getElementById('result').innerHTML = `Error: ${e.msg}`;
                }
            });


            wsdirect.PubAPI.publicMethod(2, 3).then(function(res) {
                alert(`Promise result: ${res}`);
            }).catch(function(e) {
                alert(`Promise error: ${e.msg}`);
            });
        </script>
    </head>

    <body>
        <h1>Hi!</h1>

        <div id="result" style="border: 1px dotted gray;"></div>
    </body>
</html>

```

### ExtJS 5.1 Grid example:
```html
<html>
    <head>
        <script src="http://localhost:3500/socket.io/socket.io.js"></script>
        <script src="http://localhost:3500/ws.direct.client.js"></script>
        <script src="http://localhost:3500/initMyAPI.js"></script>
        <script src="http://cdn.sencha.com/ext/gpl/5.1.0/build/ext-all-debug.js"></script>
        <script src="http://cdn.sencha.com/ext/gpl/5.1.0/build/packages/ext-theme-crisp/build/ext-theme-crisp.js"></script>
        <link rel="stylesheet" href="http://cdn.sencha.com/ext/gpl/5.1.0/build/packages/ext-theme-crisp/build/resources/ext-theme-crisp-all.css">
        <script src="http://localhost:3500/Ext5DirectProxyOverride.js"></script>

        <script>
        
            Ext.define('App.view.Viewport', {
                extend: 'Ext.container.Viewport',
                items: {
                    xtype: 'gridpanel',
                    title: 'The list of characters',
                    store: {
                        autoLoad: true,
                        proxy: {
                            type: 'direct',
                            api: {
                                read: 'wsdirect.PubAPI.getListOfCharacters'
                            }
                        },
                        fields: [
                            {
                                name: 'name',
                                type: 'string'
                            }
                        ]
                    },
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            flex: 1,
                            dataIndex: 'name',
                            text: 'Name'
                        }
                    ]
                }
            });

            Ext.application({
                name: 'App',
                launch: function() {
                    Ext.create('App.view.Viewport');
                }
            });

        </script>
    </head>

    <body>
    </body>
</html>
```


## Author
 - Aleksander Moskvitin