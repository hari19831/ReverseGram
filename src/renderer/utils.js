(function() {
  var remote,
    __slice = [].slice;

  remote = require('electron').remote;

  module.exports = {
    downloadFileWithGrauth: function(url, dest, ok, fail, grauth) {
      var err, fs, handleFail, handleOk, handled, options, request;
      request = remote.require('request');
      fs = remote.require('fs');
      try {
        console.log("utils.downloadFile (" + url + ", " + dest + ")");
        handled = false;
        handleOk = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          console.log("utils.downloadFile: OK (" + args + "), handled = " + handled);
          if (!handled) {
            handled = true;
            return ok.apply(null, args);
          } else {
            return console.log("utils.downloadFile: OK already handled!");
          }
        };
        handleFail = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          console.log("utils.downloadFile: FAILED (" + args + ")");
          if (!handled) {
            handled = true;
            fs.unlink(dest);
            return fail.apply(null, args);
          } else {
            return console.log("utils.downloadFile: FAILED already handled!");
          }
        };
        if ((grauth != null) && grauth !== '') {
          options = {
            url: url,
            method: 'GET',
            headers: {
              'Cookie': "grauth=" + grauth
            }
          };
          return request(options).on('response', function(resp) {
            return console.log("utils.downloadFile: HTTP response = " + resp + ", " + resp.statusCode);
          }).on('error', function(err) {
            console.log("utils.downloadFile: HTTP ERROR " + err);
            return handleFail(err);
          }).pipe(fs.createWriteStream(dest)).on('error', function(err) {
            console.log("utils.downloadFile: download ERROR " + err);
            return handleFail(err);
          }).on('close', handleOk);
        } else {
          return fail();
        }
      } catch (_error) {
        err = _error;
        console.log("utils.downloadFile: EXCEPTION " + err);
        return fail(err);
      }
    },
    getFileName: function(url, grauth, callback) {
      var err, options, request;
      request = remote.require('request');
      try {
        console.log("utils.getFileName (" + url + ")");
        options = {
          url: url,
          method: 'GET',
          headers: {
            'Cookie': "grauth=" + grauth
          }
        };
        return request(options).on('response', function(resp) {
          var CONTENT_DISPOSITION_RE, content_disposition, filename, match, _ref;
          console.log("utils.getFileName: HTTP response = " + resp + ", " + resp.statusCode);
          CONTENT_DISPOSITION_RE = /filename=\"(.*)\"|attachment; filename\*=UTF-8''(.*)/i;
          content_disposition = resp != null ? (_ref = resp.headers) != null ? _ref['content-disposition'] : void 0 : void 0;
          match = content_disposition != null ? content_disposition.match(CONTENT_DISPOSITION_RE) : void 0;
          filename = (match != null ? match[1] : void 0) || ((match != null ? match[2] : void 0) ? decodeURI(match != null ? match[2] : void 0) : void 0);
          resp.destroy();
          if (filename && filename !== '') {
            return typeof callback === "function" ? callback(filename) : void 0;
          } else {
            console.log("WARNING: could not parse filename from '" + content_disposition + "'");
            return typeof callback === "function" ? callback() : void 0;
          }
        }).on('error', function(err) {
          console.log("utils.getFileName: HTTP ERROR " + err);
          return typeof callback === "function" ? callback() : void 0;
        });
      } catch (_error) {
        err = _error;
        console.log("utils.getFileName: EXCEPTION " + err);
        return typeof callback === "function" ? callback() : void 0;
      }
    }
  };

}).call(this);
