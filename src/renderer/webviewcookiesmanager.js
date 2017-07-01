(function() {
  var WebViewCookiesManager, config, electron;

  electron = require('electron');

  config = require('./../config');

  WebViewCookiesManager = (function() {
    function WebViewCookiesManager() {
      console.log('WebViewCookiesManager:ctor');
      this.session = electron.remote.session.fromPartition("persist:grammarly");
      this.cookies = this.session.cookies;
    }

    WebViewCookiesManager.prototype.GRAUTH_COOKIE_NAME = 'grauth';

    WebViewCookiesManager.prototype.COOKIE_URL = config.cookie.url;

    WebViewCookiesManager.prototype.COOKIE_DOMAIN = config.cookie.domain;

    WebViewCookiesManager.prototype.setCookie = function(key, value, expires, callback) {
      var cookie;
      if (key === this.GRAUTH_COOKIE_NAME) {
        console.log("WebViewCookiesManager: set grauth");
      }
      cookie = {
        url: this.COOKIE_URL,
        name: key,
        value: value,
        domain: this.COOKIE_DOMAIN,
        secure: true,
        expirationDate: expires.getTime()
      };
      return this.cookies.set(cookie, function(error) {
        if (error) {
          console.log("WebViewCookiesManager: can't set cookie ${error}");
        }
        return typeof callback === "function" ? callback(error) : void 0;
      });
    };

    WebViewCookiesManager.prototype.setPersistentCookie = function(key, value, callback) {
      var expires;
      expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      return this.setCookie(key, value, expires, callback);
    };

    WebViewCookiesManager.prototype.getGrauth = function(callback) {
      var query;
      query = {
        url: this.COOKIE_URL,
        name: this.GRAUTH_COOKIE_NAME,
        domain: this.COOKIE_DOMAIN
      };
      return this.cookies.get(query, function(error, cookies) {
        console.log("error: " + error + ";");
        if ((cookies != null ? cookies.length : void 0) > 0) {
          return typeof callback === "function" ? callback(cookies[0].value) : void 0;
        } else {
          return typeof callback === "function" ? callback(null) : void 0;
        }
      });
    };

    WebViewCookiesManager.prototype.clearGrauth = function(callback) {
      return this.setPersistentCookie(this.GRAUTH_COOKIE_NAME, '', callback);
    };

    WebViewCookiesManager.prototype.clearCookies = function(callback) {
      return this.session.clearStorageData({
        storages: ['cookies']
      }, function() {
        console.log("WebViewCookiesManager: clearStorageData");
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    WebViewCookiesManager.prototype.migrateGrauth = function(callback) {
      var cookie, key, obj, webViewCookies, _results;
      console.log("WebViewCookiesManager: migrate grauth");
      cookie = localStorage.getItem('webViewCookies');
      localStorage.removeItem('webViewCookies');
      if (!cookie) {
        return typeof callback === "function" ? callback() : void 0;
      } else {
        try {
          webViewCookies = JSON.parse(cookie || '{}') || {};
          _results = [];
          for (key in webViewCookies) {
            if (key === this.GRAUTH_COOKIE_NAME) {
              obj = webViewCookies[key];
              _results.push(this.setPersistentCookie(key, obj.value, callback));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } catch (_error) {
          console.log("WebViewCookiesManager: FAILED to parse cookies, just remove it");
          return typeof callback === "function" ? callback() : void 0;
        }
      }
    };

    return WebViewCookiesManager;

  })();

  module.exports = new WebViewCookiesManager();

}).call(this);
