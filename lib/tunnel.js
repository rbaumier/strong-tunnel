// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var net = require('net');
var ssh2 = require('ssh2');
var _ = require('lodash');

module.exports = function(urlWrapper) {

  return function makeTunnel(urlObj, opts, callback, socketErrorCallback) {
    // if callback was already call we will call `socketErrorCallback` instead of error
    var fCalled = false;
    // because .on('error'), can call `callback` after the `callback` was already called.
    var f = (err, ok) => {
      if (fCalled && !ok) {
        // only forward error to socketErrorCallback when callback has already been called
        return socketErrorCallback(err);
      }
      fCalled = true;
      callback(err, ok);
    };

    var conn = new ssh2.Client();
    var env = process.env;
    var username = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

    // extract hostname from url
    opts.host = opts.host || urlObj.hostname;

    // assume ssh is on port 22
    opts.port = opts.port || 22;

    // assume ssh user is the same as current user if not specified
    opts.username = opts.username || env.SSH_USER || username;

    // assume ssh agent if no other auth given
    if (!opts.password && !opts.privateKey) {
      opts.agent = opts.agent || process.env.SSH_AUTH_SOCK;
    }

    conn.on('error', f);
    conn.on('ready', function() {

      const lAddr = '127.0.0.1';
      // connect to remote localhost from the remote host
      const rAddr = '127.0.0.1';
      // don't conflict with anything
      const lPort = 0;
      // use the port from the input URL
      const rPort = urlObj.port;

      //                      [SSH Client] -> [Server distant] -> Redis
      // [Server local (url)]     |
      // CnxServer => socket.connect(url)
      conn.forwardOut(lAddr, lPort, rAddr, rPort, function(err, stream) {
        if (err) {
          return f(err);
        }
        stream.on('error', socketErrorCallback);
      });

      // makeProxy will forward in callback the underneath local server created
      makeProxy(conn, urlObj, socketErrorCallback, (err, url, server) => {
        f(err, {
          url: url,
          sshClient: conn,
          localServer: server
        });
        conn = null;
      });
      // don't keep the process alive if all we have is this connection
      conn._sock.unref();
    })


    try {
      conn.connect(opts);
    } catch (err) {
      f(err, {
        url: null,
        sshClient: conn,
        localServer: null
      });
    }

    return conn;
  }
};
