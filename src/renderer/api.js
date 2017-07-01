(function() {
  var Api, ORIGIN, config, fs, request, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  request = require('request');

  fs = require('fs');

  config = require('./../config');

  ORIGIN = "https://app.grammarly.com";

  module.exports = Api = (function() {
    _.extend(Api.prototype);

    function Api(options) {}

    Api.prototype.login = function(email, password, success, failure) {
      var options;
      console.log("Api:login (" + email + ", ********)");
      options = {
        url: "" + config.authUrl + "/login",
        form: {
          email: email,
          password: password
        },
        method: 'POST',
        headers: {
          'Origin': ORIGIN
        }
      };
      return request(options, function(err, resp, body) {
        var exc, fail, ok, result;
        console.log("Api:login => " + err + ", " + resp + ", <body>");
        try {
          if ((err == null) && resp.statusCode === 200) {
            result = JSON.parse(body);
            if (result.grauth != null) {
              if (!(result != null ? result.anonymous : void 0)) {
                ok = result;
              } else {
                fail = {
                  error: "user is anonymous!",
                  resp: resp
                };
              }
            } else {
              if (result.error != null) {
                fail = result;
              } else {
                fail = {
                  error: "unrecognized response: " + body,
                  resp: resp
                };
              }
            }
          } else if ((err == null) && resp.statusCode === 401) {
            fail = {
              error: "user_not_authorized",
              resp: resp
            };
          } else if ((err == null) && resp.statusCode === 404) {
            fail = {
              error: "user_not_found",
              resp: resp
            };
          } else {
            fail = {
              error: "response is not 200 OK: " + resp,
              err: err,
              resp: resp
            };
          }
        } catch (_error) {
          exc = _error;
          fail = {
            error: "exception: " + exc,
            exc: exc
          };
        }
        if (ok != null) {
          return success(ok);
        } else {
          return failure(fail);
        }
      });
    };

    Api.prototype.user = function(token, success, failure) {
      var options;
      console.log("Api:user");
      options = {
        url: "" + config.authUrl + "/user",
        method: 'GET',
        headers: {
          'Cookie': "grauth=" + token,
          'Origin': ORIGIN
        }
      };
      return request(options, function(err, resp, body) {
        var exc, fail, ok, result;
        console.log("Api:user => " + err + ", " + resp + ", <body>");
        console.log(resp);
        try {
          if ((err == null) && resp.statusCode === 200) {
            result = JSON.parse(body);
            if (!(result != null ? result.anonymous : void 0)) {
              ok = result;
            } else {
              fail = {
                error: "user is anonymous!",
                resp: resp
              };
            }
          } else if ((err == null) && resp.statusCode === 401) {
            fail = {
              error: "user_not_authorized",
              resp: resp
            };
          } else if ((err == null) && resp.statusCode === 404) {
            fail = {
              error: "user_not_found",
              resp: resp
            };
          } else {
            fail = {
              error: "response is not 200 OK: " + resp,
              err: err,
              resp: resp
            };
          }
        } catch (_error) {
          exc = _error;
          fail = {
            error: "exception: " + exc,
            exc: exc
          };
        }
        if (ok != null) {
          return success(ok);
        } else {
          return failure(fail);
        }
      });
    };

    Api.prototype.sendFeedback = function(args, success, failure) {
      var options;
      console.log("Api:sendFeedback " + args);
      options = {
        url: 'https://api.parse.com/1/classes/userFeedback',
        method: 'POST',
        json: args,
        headers: {
          'X-Parse-Application-Id': 'FY1mF3QsgXS8KUwkdUQkqE3kUB6z3SBRVxL3b3y0',
          'X-Parse-REST-API-Key': 'QPSC0n6TqlqbGS9gTrvV6qGbavptwSd9Neu0j8Xc'
        }
      };
      return request(options, function(err, resp, body) {
        var exc, fail, ok;
        console.log("Api:sendFeedback => " + err + ", " + resp + ", <body>");
        try {
          if ((err == null) && resp.statusCode === 201) {
            ok = 'created';
          } else {
            fail = {
              error: "response is not 201 OK: " + resp,
              err: err,
              resp: resp
            };
          }
        } catch (_error) {
          exc = _error;
          fail = {
            error: "exception: " + exc,
            exc: exc
          };
        }
        if (ok != null) {
          return success(ok);
        } else {
          return failure(fail);
        }
      });
    };

    Api.prototype.uploadFile = function(grauth, pathToUpload, success, failure) {
      var options;
      console.log("Api:uploadFile " + pathToUpload);
      options = {
        url: "" + config.doxUrl + "/documents",
        method: 'POST',
        formData: {
          source_file: fs.createReadStream(pathToUpload)
        },
        headers: {
          'Cookie': "grauth=" + grauth
        }
      };
      return request(options, function(err, resp, body) {
        var exc, result;
        console.log("Api:uploadFile => " + err + ", " + resp);
        if ((err == null) && resp.statusCode === 201) {
          try {
            result = JSON.parse(body);
            if (result.id != null) {
              return success(result.id);
            } else {
              return success(void 0);
            }
          } catch (_error) {
            exc = _error;
            return failure(err, resp, exc);
          }
        } else {
          return failure(err, resp, null);
        }
      });
    };

    Api.prototype.DESKTOP_EDITOR_USED_GROUP = 'desktop_editor_used';

    Api.prototype.ensureUsedDesktopEditorTracking = function(token, userData, success, failure) {
      var maybeSetGroup, maybeSetSetting, os_group, os_name;
      console.log("Api:ensureUsedDesktopEditorTracking...");
      maybeSetSetting = (function(_this) {
        return function(success, failure) {
          var _ref;
          if ((((_ref = userData.settings) != null ? _ref.usedDesktopEditor : void 0) != null) !== true) {
            console.log("Api:ensureUsedDesktopEditorTracking -> setting the setting");
            return _this.setUsedDesktopEditorSetting(token, success, failure);
          } else {
            console.log("Api:ensureUsedDesktopEditorTracking -> NOT setting the setting, it already is");
            return typeof success === "function" ? success('already-set') : void 0;
          }
        };
      })(this);
      maybeSetGroup = (function(_this) {
        return function(group, success, failure) {
          if (!(__indexOf.call(userData.groups, group) >= 0)) {
            console.log("Api:ensureUsedDesktopEditorTracking -> setting the " + group + " group");
            return _this.setGroup(token, group, success, failure);
          } else {
            console.log("Api:ensureUsedDesktopEditorTracking -> NOT setting the " + group + " group, it already is");
            return typeof success === "function" ? success('already-set') : void 0;
          }
        };
      })(this);
      os_name = {
        darwin: 'osx',
        linux: 'linux',
        win32: 'windows'
      }[process.platform] || 'unknown';
      os_group = "desktop_editor_" + os_name;
      return maybeSetSetting((function(_this) {
        return function() {
          return maybeSetGroup(_this.DESKTOP_EDITOR_USED_GROUP, function() {
            return maybeSetGroup(os_group, success, failure);
          }, failure);
        };
      })(this), failure);
    };

    Api.prototype.setUsedDesktopEditorSetting = function(token, success, failure) {
      var options;
      console.log("Api:setUsedDesktopEditorSetting...");
      options = {
        url: "" + config.authUrl + "/user/settings",
        method: 'POST',
        json: {
          usedDesktopEditor: true
        },
        headers: {
          'Cookie': "grauth=" + token,
          'Origin': ORIGIN
        }
      };
      return request(options, function(err, resp, body) {
        var fail, ok;
        console.log("Api:setUsedDesktopEditorSetting => " + err + ", " + resp + ", <body>");
        try {
          if ((err == null) && resp.statusCode === 200) {
            ok = 'ok';
          } else {
            fail = {
              error: "response is not 200 OK: " + resp
            };
          }
        } catch (_error) {
          err = _error;
          fail = {
            error: "exception: " + err
          };
        }
        if (ok != null) {
          return typeof success === "function" ? success(ok) : void 0;
        } else {
          return typeof failure === "function" ? failure(fail) : void 0;
        }
      });
    };

    Api.prototype.setGroup = function(token, group, success, failure) {
      var options;
      console.log("Api:setGroup " + group + "...");
      options = {
        url: "" + config.authUrl + "/user/group",
        method: 'POST',
        form: {
          group: group
        },
        headers: {
          'Cookie': "grauth=" + token,
          'Origin': ORIGIN
        }
      };
      return request(options, function(err, resp, body) {
        var fail, ok;
        console.log("Api:setGroup => " + err + ", " + resp + ", <body>");
        try {
          if ((err == null) && resp.statusCode === 200) {
            ok = 'ok';
          } else {
            fail = {
              error: "response is not 200 OK: " + resp
            };
          }
        } catch (_error) {
          err = _error;
          fail = {
            error: "exception: " + err
          };
        }
        if (ok != null) {
          return typeof success === "function" ? success(ok) : void 0;
        } else {
          return typeof failure === "function" ? failure(fail) : void 0;
        }
      });
    };

    return Api;

  })();

}).call(this);
