
/*
Cache for source code transpiled by babel.

Inspired by https://github.com/atom/atom/blob/6b963a562f8d495fbebe6abdbafbc7caf705f2c3/src/coffee-cache.coffee.
 */

(function() {
  var babel, cacheDir, createBabelVersionAndOptionsDigest, createOptions, crypto, defaultOptions, fs, getCachePath, getCachedJavaScript, jsCacheDir, loadFile, path, register, stats, updateDigestForJsonValue;

  crypto = require('crypto');

  fs = require('fs-plus');

  path = require('path');

  babel = require('babel-core');

  stats = {
    hits: 0,
    misses: 0
  };

  defaultOptions = {
    sourceMap: 'inline',
    reactCompat: true,
    blacklist: ['useStrict'],
    experimental: true,
    optional: ['asyncToGenerator']
  };


  /*
  shasum - Hash with an update() method.
  value - Must be a value that could be returned by JSON.parse().
   */

  updateDigestForJsonValue = function(shasum, value) {
    var item, key, keys, type, _i, _j, _len, _len1;
    type = typeof value;
    if (type === 'string') {
      shasum.update('"', 'utf8');
      shasum.update(value, 'utf8');
      return shasum.update('"', 'utf8');
    } else if (type === 'boolean' || type === 'number') {
      return shasum.update(value.toString(), 'utf8');
    } else if (value === null) {
      return shasum.update('null', 'utf8');
    } else if (Array.isArray(value)) {
      shasum.update('[', 'utf8');
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        item = value[_i];
        updateDigestForJsonValue(shasum, item);
        shasum.update(',', 'utf8');
      }
      return shasum.update(']', 'utf8');
    } else {
      keys = Object.keys(value);
      keys.sort();
      shasum.update('{', 'utf8');
      for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
        key = keys[_j];
        updateDigestForJsonValue(shasum, key);
        shasum.update(': ', 'utf8');
        updateDigestForJsonValue(shasum, value[key]);
        shasum.update(',', 'utf8');
      }
      return shasum.update('}', 'utf8');
    }
  };

  createBabelVersionAndOptionsDigest = function(version, options) {
    var shasum;
    shasum = crypto.createHash('sha1');
    shasum.update('babel-core', 'utf8');
    shasum.update('\0', 'utf8');
    shasum.update(version, 'utf8');
    shasum.update('\0', 'utf8');
    updateDigestForJsonValue(shasum, options);
    return shasum.digest('hex');
  };

  cacheDir = path.join(fs.absolute('~/.atom'), 'compile-cache');

  jsCacheDir = path.join(cacheDir, createBabelVersionAndOptionsDigest(babel.version, defaultOptions), 'js');

  getCachePath = function(sourceCode) {
    var digest;
    digest = crypto.createHash('sha1').update(sourceCode, 'utf8').digest('hex');
    return path.join(jsCacheDir, "" + digest + ".js");
  };

  getCachedJavaScript = function(cachePath) {
    var cachedJavaScript;
    if (fs.isFileSync(cachePath)) {
      try {
        cachedJavaScript = fs.readFileSync(cachePath, 'utf8');
        stats.hits++;
        return cachedJavaScript;
      } catch (_error) {}
    }
    return null;
  };

  createOptions = function(filePath) {
    var key, options, value;
    options = {
      filename: filePath
    };
    for (key in defaultOptions) {
      value = defaultOptions[key];
      options[key] = value;
    }
    return options;
  };

  loadFile = function(module, filePath) {
    var cachePath, error, js, options, sourceCode;
    sourceCode = fs.readFileSync(filePath, 'utf8');
    if (!/^("use 6to5"|'use 6to5'|"use babel"|'use babel')/.test(sourceCode)) {
      module._compile(sourceCode, filePath);
      return;
    }
    cachePath = getCachePath(sourceCode);
    js = getCachedJavaScript(cachePath);
    if (!js) {
      options = createOptions(filePath);
      try {
        js = babel.transform(sourceCode, options).code;
        stats.misses++;
      } catch (_error) {
        error = _error;
        console.error('Error compiling %s: %o', filePath, error);
        throw error;
      }
      try {
        fs.writeFileSync(cachePath, js);
      } catch (_error) {
        error = _error;
        console.error('Error writing to cache at %s: %o', cachePath, error);
        throw error;
      }
    }
    return module._compile(js, filePath);
  };

  register = function() {
    return Object.defineProperty(require.extensions, '.js', {
      writable: false,
      value: loadFile
    });
  };

  module.exports = {
    register: register,
    getCacheMisses: function() {
      return stats.misses;
    },
    getCacheHits: function() {
      return stats.hits;
    },
    createBabelVersionAndOptionsDigest: createBabelVersionAndOptionsDigest
  };

}).call(this);
