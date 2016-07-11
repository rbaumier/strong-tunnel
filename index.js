// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var urlWrapper = require('./urlWrapper');
var tunnel = require('./lib/tunnel')(urlWrapper);

module.exports = function fromUrl(url, opts, callback) {
  if (callback === undefined && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  opts = opts || {};

  var obj = JSON.parse(JSON.stringify(url));

  if (typeof obj === 'string') {
    obj = urlWrapper.parse(obj);
  }

  obj.protocol = ':'
  // we've replaced the port, so delete host so URL is recomposed using

  // $hostname:$port for $host
  delete obj.host;
  tunnel(obj, opts, function(err, connection) {
    if (err) {
      return callback(err);
    }
    callback(null, connection);
  });
}
