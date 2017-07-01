(function() {
  var FileUploader, dialog, ipc, ipcRenderer, knownExtensions, path, remote, _, _ref,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('electron'), ipcRenderer = _ref.ipcRenderer, remote = _ref.remote;

  path = require('path');

  ipc = ipcRenderer;

  dialog = remote.dialog;

  knownExtensions = ['.txt', '.rtf', '.html', '.htm', '.doc', '.docx'];

  module.exports = FileUploader = (function() {
    function FileUploader(api, webViewCookiesManager, loadSettings, onUploadStarted, onUploadFinished) {
      var _ref1, _ref2, _ref3;
      this.api = api;
      this.webViewCookiesManager = webViewCookiesManager;
      this.loadSettings = loadSettings;
      console.log("filesToUpload is " + ((_ref1 = this.loadSettings) != null ? _ref1.filesToUpload : void 0));
      this.onStartPathToUpload = _.first((_ref2 = (_ref3 = this.loadSettings) != null ? _ref3.filesToUpload : void 0) != null ? _ref2 : []);
      console.log("onStartPathToUpload is " + this.onStartPathToUpload);
      ipc.on('message', (function(_this) {
        return function() {
          var args, message, pathToUpload;
          message = arguments[0], pathToUpload = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
          if (message === 'application:upload-file') {
            return _this.webViewCookiesManager.getGrauth(function(grauth) {
              console.log("FileUploader:on 'application:upload-file' =>");
              if ((grauth == null) || grauth === '') {
                return _this.showMessageNotLoggedIn();
              } else if (pathToUpload != null) {
                onUploadStarted();
                return _this.uploadFile(grauth, pathToUpload, onUploadFinished, function(err, resp, exc) {
                  if ((exc != null ? exc.code : void 0) === 'ENOENT') {
                    return _this.showMessageFileNotFound(function() {
                      return onUploadFinished(null);
                    });
                  } else {
                    return _this.showMessageThereWasAProblem(function() {
                      return onUploadFinished(null);
                    });
                  }
                });
              } else {
                return _this.showMessageThereWasAProblem();
              }
            });
          }
        };
      })(this));
    }

    FileUploader.prototype.showMessageNotLoggedIn = function(callback) {
      var opts;
      opts = {
        type: 'warning',
        title: 'Grammarly',
        buttons: ['OK'],
        message: 'You need to be logged in to Grammarly in order to import documents.',
        detail: 'Please log in to Grammarly and try again.'
      };
      return dialog.showMessageBox(opts, function(args) {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    FileUploader.prototype.showMessageThereWasAProblem = function(callback) {
      var opts;
      opts = {
        type: 'warning',
        title: 'Grammarly',
        buttons: ['OK'],
        message: 'There was a problem importing your document.',
        detail: 'Please try again later.'
      };
      return dialog.showMessageBox(opts, function(args) {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    FileUploader.prototype.showMessageBadExtension = function(callback) {
      var opts;
      opts = {
        type: 'warning',
        title: 'Grammarly',
        buttons: ['OK'],
        message: 'This document format is not supported.',
        detail: "Grammarly can import documents of the following types: " + (knownExtensions.map(function(x) {
          return x.slice(1).toUpperCase();
        }).join(', ')) + "."
      };
      return dialog.showMessageBox(opts, function(args) {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    FileUploader.prototype.showMessageFileNotFound = function(callback) {
      var opts;
      opts = {
        type: 'warning',
        title: 'Grammarly',
        buttons: ['OK'],
        message: 'There was a problem importing your document.',
        detail: 'The file was not found.'
      };
      return dialog.showMessageBox(opts, function(args) {
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    FileUploader.prototype.uploadFile = function(grauth, pathToUpload, success, failure) {
      var _ref1;
      console.log("FileUpload:uploadFile => " + pathToUpload);
      if (_ref1 = path.extname(pathToUpload), __indexOf.call(knownExtensions, _ref1) >= 0) {
        return this.api.uploadFile(grauth, pathToUpload, function(docId) {
          console.log('FileUpload:uploadFile => success');
          if (docId != null) {
            return success(docId);
          } else {
            return failure({
              error: "docId is " + docId
            });
          }
        }, function(err, resp, exc) {
          console.log("FileUpload:uploadFile => failure: " + err + ", " + resp + ", " + exc);
          return failure(err, resp, exc);
        });
      } else {
        return failure('unsupported-format');
      }
    };

    return FileUploader;

  })();

}).call(this);
