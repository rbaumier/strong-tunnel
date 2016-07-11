// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tunnel
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

const urlWrapper = require('./urlWrapper');
const tunnel = require('./lib/tunnel')(urlWrapper);

/**
 * [exports description]
 * @param  {string}   host     e.g. "domainname:port"
 * @param  {object}   opts
 * @param  {Function} f(err, {url:, sshClient:, localServer:})
 * @param  {Function} socketErrorCallback(err)
 * @return {[type]}
 */
module.exports = function fromUrl(host, opts, f, socketErrorCallback) {

  opts = opts || {};

  const obj = urlWrapper.parse(host);
  obj.protocol = ':';
    // we've replaced the port, so delete host so URL is recomposed using
    // $hostname:$port for $host
  delete obj.host;

  tunnel(obj, opts, f, socketErrorCallback);
}
