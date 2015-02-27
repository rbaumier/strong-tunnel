return;
var fmt = require('util').format;
var fs = require('fs');
var http = require('http');
var newSSHServer = require('./server');
var st = require('../');
// var tap = require('tap');

tap.test('attempts connection using settings', function(t) {
  var httpServer = http.createServer(function(req, res) {
  //   t.ok(req, 'got a request');
    res.end(JSON.stringify(process.versions));
  });

  var sshServer = newSSHServer(function() {
    httpServer.listen(0, function() {
      var tunneled = fmt('http+ssh://127.0.0.1:%d/', httpServer.address().port);
      var opts = {
        port: sshServer.address().port,
        privateKey: fs.readFileSync(require.resolve('./ssh2_user_key')),
      };
      st(tunneled, opts, function(err, url) {
        http.get(url, function(res) {
          res.on('data', function(d) {
            console.log('rx', d);
          //   t.ok(d, 'received response');
            httpServer.close(function() {
              console.log('http server shutdown');
            });
            sshServer.close(function() {
              console.log('ssh server shutdown');
            })
          });
        });
      })
    });
  });
  sshServer.on('connection', console.log.bind(console, 'connection: %s'));
  sshServer.on('username', console.log.bind(console, 'user: %s'));
  sshServer.on('key', console.log.bind(console, 'key: %s'));
  sshServer.on('tcpip', console.log.bind(console, 'tcpip: %s'));

  // var tunneled = fmt('http+ssh://127.0.0.1:10000/', server.address().port);
  // st('http+ssh://127.0.0.1:10000/', {}, function(err, url) {
  //   http.get(url, function(res) {
  //     // res.on('data', function(d) {
  //     //   t.ok(d, 'received response');
  //     //   server.close();
  //     // });
  //   });
  // })
  // t.plan(9);
  //
  // var env = process.env;
  // var username = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
  // t.assert(username, 'there is a username');
  //
  // t.assert(env.SSH_AUTH_SOCK, 'there is an ssh agent socket open');
  //
  var server = http.createServer(function(req, res) {
  //   t.ok(req, 'got a request');
    res.end(JSON.stringify(process.versions));
  });
  //
  // server.listen(0, function() {
  //   var direct = fmt('http://127.0.0.1:%d/', server.address().port);
  //   var tunneled = fmt('http+ssh://127.0.0.1:%d/', server.address().port);
  //
  //   t.ok(server.address(), 'test http server listening');
  //
  //   st(tunneled, function(err, url) {
  //     t.ifError(err, 'strong-tunnel should not error on url ' + tunneled);
  //     t.notEqual(url, direct);
  //     t.notEqual(url, tunneled);
  //     assertRequest(url);
  //   });
  // });
  //
  // function assertRequest(url) {
  //   t.assert(url, 'url: ' + url);
  //   http.get(url, function(res) {
  //     res.on('data', function(d) {
  //       t.ok(d, 'received response');
  //       server.close();
  //     });
  //   }).on('error', function(err) {
  //     t.ifError(err);
  //   });
  // }
});
