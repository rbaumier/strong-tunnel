'use strict';

var libUrl = require('url');

function libUrlWrapper(fn, url, callback) {
  try {
    var convertedUrl = fn(url);
    return callback ? callback(null, convertedUrl) : convertedUrl;
  } catch (error) {
    return callback ? callback(error) : error;
  }
}

module.exports = {
  format: function(url, callback) {
    return libUrlWrapper(libUrl.format, url, callback);
  },

  parse: function(url, callback) {
    return libUrlWrapper(libUrl.parse, url, callback);
  }
};

