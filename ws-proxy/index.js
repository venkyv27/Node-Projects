var util = require('util'),
    http = require('http'),
    //colors = require('colors'),
    httpProxy = require('http-proxy');

try {
  var io = require('socket.io')(proxyServer),
      //client = require('socket.io-client');
      client = io({
  transportOptions: {
    polling: {
      extraHeaders: {
        'x-clientid': 'abc'
      }
    }
  }
});
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
var server = io.listen(9015); //STEP 5
server.sockets.on('connection', function (client) {
  console.log('Got websocket connection');

  //var data = client.request;
  var data = client.handshake;
  console.log("Logging extra: " + data.extra);


  client.on('message', function (msg) {// STEP 10
    console.log('Got message from client: ' + msg);
  });

  client.send('from server');//STEP 7
});

io.use((socket, next) => {
  let clientId = socket.handshake.headers['x-clientid'];
  console.log(clientId);  
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
var proxyServer = http.createServer(function (req, res) {// STEP 1
  console.log("Create http server")
  proxy.web(req, res); //STEP 2: create proxy server too
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {//STEP 6
  console.log("Upgrading")
  proxy.ws(req, socket, head); //Every proxy call, calls http server too and print the log message 
});

proxyServer.listen(8015); // STEP 3: Listening on 8015

//
// Setup the socket.io client against our proxy
//
var ws = client.connect('ws://localhost:8015', {extra:"foobar"}); //STEP 4, Starts as http:// call and then becomes ws://

ws.on('message', function (msg) { //STEP 8
  console.log('Got message: ' + msg);
  ws.send('I am the client');//STEP 9
});