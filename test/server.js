var fs = require('fs');
var crypto = require('crypto');
var buffersEqual = require('buffer-equal-constant-time');
var net = require('net');
var ssh2 = require('ssh2');
var utils = ssh2.utils;
var Server = ssh2.Server;
var EventEmitter = require('events').EventEmitter;

var hostPrivateKey = require.resolve('./ssh2_host_key');
var userPrivateKey = require.resolve('./ssh2_user_key');
var hostPubKey = require.resolve('./ssh2_host_key.pub');
var userPubKey = require.resolve('./ssh2_user_key.pub');

var pubKey = utils.genPublicKey(utils.parseKey(fs.readFileSync(userPrivateKey)));

module.exports = makeServer;

function makeServer(opts, callback) {
  if (callback === undefined && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  // var serverEE = new EventEmitter();

  var server = new Server({
    privateKey: fs.readFileSync(hostPrivateKey)
  }, function(client) {
    console.log('Client connected!');
    client.on('authentication', function(ctx) {
      if (ctx.username) {
        server.emit('username', ctx.username);
      }
      if (ctx.method === 'password'
          && ctx.username === 'foo'
          && ctx.password === 'bar')
        ctx.accept();
      else if (ctx.method === 'publickey'
               && ctx.key.algo === pubKey.fulltype
               && buffersEqual(ctx.key.data, pubKey.public)) {
        if (ctx.signature) {
          var verifier = crypto.createVerify(ctx.sigAlgo);
          verifier.update(ctx.blob);
          if (verifier.verify(pubKey.publicOrig, ctx.signature, 'binary'))
            ctx.accept();
          else
            ctx.reject();
        } else {
          // if no signature present, that means the client is just checking
          // the validity of the given public key
          ctx.accept();
        }
      } else
        ctx.reject();
    }).on('ready', function() {
      console.log('Client authenticated!');

      client.on('session', function(accept, reject) {
        var session = accept();
        session.once('exec', function(accept, reject, info) {
          console.log('Client wants to execute: ' + inspect(info.command));
          var stream = accept();
          stream.stderr.write('Oh no, the dreaded errors!\n');
          stream.write('Just kidding about the errors!\n');
          stream.exit(0);
          stream.end();
        });
      });
    }).on('tcpip', function(accept, reject, info) {
      server.emit('tcpip', info);
      console.log('tcpip', info);
      var stream = accept();
      var tcpClient = net.connect({ host: info.destIP, port: info.destPort });
      return tcpClient.on('connect', function() {
        stream.pipe(tcpClient).pipe(stream);
        stream.on('end', function() {
          client.end();
        });
      });
      // stream.
      // console.log('stream', stream);
    }).on('end', function() {
      console.log('Client disconnected');
    });
  }).listen(0, '127.0.0.1', function() {
    console.log('Listening on port ' + this.address().port);
    setImmediate(callback, server);
  });
  return server;
}
