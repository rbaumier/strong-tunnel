// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var tunnel = require('./lib/tunnel');
var libUrl = require('url');

module.exports = fromUrl;

function fromUrl(url, opts, callback) {
  if (callback === undefined && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  opts = opts || {};

  var obj = JSON.parse(JSON.stringify(url));

  if (typeof obj === 'string') {
    obj = parseUrl(obj);
  }

  obj.protocol = obj.protocol.replace(/\+ssh:$/, ':');
  // we've replaced the port, so delete host so URL is recomposed using

  // $hostname:$port for $host
  delete obj.host;
  tunnel(obj, opts, function(err, urlObj) {
    if (err) {
      return callback(err);
    }
    formatUrl(urlObj, callback);
  });
}

function libUrlWrapper(fn, url, callback) {
  try {
    var convertedUrl = fn(url);
    return callback ? callback(null, convertedUrl) : convertedUrl;
  } catch (error) {
    return callback ? callback(error) : error;
  }
}

function formatUrl(url, callback) {
  return libUrlWrapper(libUrl.format, url, callback);
}

function parseUrl(url, callback) {
  return libUrlWrapper(libUrl.parse, url, callback);
}
