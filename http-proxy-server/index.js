var util = require('util'),
    http = require('http'),
    //colors = require('colors'),
    httpProxy = require('http-proxy');

try {
  var io = require('socket.io'),
      client = require('socket.io-client');
}
catch (ex) {
  console.error('Socket.io is required for this example:');
  console.error('npm ' + 'install'.green);
  process.exit(1);
}

//
// Create the target HTTP server and setup
// socket.io on it.
//
var server = io.listen(9015);
server.sockets.on('connection', function (client) {
  console.log('Got websocket connection');

  client.on('message', function (msg) {
    console.log('Got message from client: ' + msg);
  });

  client.send('from server');
});

//
// Setup our server to proxy standard HTTP requests
//
var proxy = new httpProxy.createProxyServer({
  target: {
    host: 'localhost',
    port: 9015
  }
});
var proxyServer = http.createServer(function (req, res) {
  proxy.web(req, res);
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

proxyServer.listen(8015);

//
// Setup the socket.io client against our proxy
//
var ws = client.connect('ws://localhost:8015');

ws.on('message', function (msg) {
  console.log('Got message: ' + msg);
  ws.send('I am the client');
});