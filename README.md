# WS.Direct
Simple RPC works through Socket.io. Allows you will get access to objects on the server.
The library is made by analogy, ext.direct. If you use override for direct.proxy, you can use the api instead of ext.direct by http.

## Requirements
 - [nodejs](http://nodejs.org)
 - [npm](http://npmjs.org)
 - [socket.io](http://http://socket.io)


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
            wsdirect.PubAPI.publucMethod(2,3, function(res, event) {
                document.getElementById('result').innerHTML = `Result: ${res}`;
            });
        </script>
    </head>

    <body>
        <h1>Hi!</h1>

        <div id="result" style="border: 1px dotted gray;"></div>
    </body>
</html>

```


## Author
 - Aleksander Moskvitin