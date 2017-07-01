(function() {
  var $, EditorController, Emitter, View, config, path, shell, url, utils, _ref;

  path = require('path');

  url = require('url');

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  Emitter = require('emissary').Emitter;

  utils = require('./utils');

  config = require('./../config');

  shell = require('electron').shell;

  module.exports = EditorController = (function() {
    Emitter.includeInto(EditorController);

    function EditorController(webview, webviewEle, loadSettings) {
      this.webview = webview;
      this.webviewEle = webviewEle;
      this.loadSettings = loadSettings;
      console.log('<<<<<<<<<<<<<<<<<< INITIALIZE >>>>>>>>>>>>>>>>>');
      this.openDevTools = this.getOpenDevTools();
      console.log(this.webview);
      console.log(this.webviewEle);
      this.webviewEle.preload = url.format({
        protocol: 'file',
        pathname: path.resolve(__dirname, '..', '..', 'static', 'preload.js'),
        slashes: true
      });
      this.webviewEle.addEventListener('new-window', (function(_this) {
        return function(e) {
          var dialog, docId, doxUrl, error, openInApp, remote, _ref1;
          e.preventDefault();
          try {
            console.log("webView:new-window to " + e.url);
            doxUrl = e != null ? (_ref1 = e.url) != null ? _ref1.match(config.regexp.doxGetId) : void 0 : void 0;
            if (doxUrl) {
              remote = require('electron').remote;
              dialog = remote.dialog;
              docId = doxUrl[1];
              console.log("webView:new-window -> DOX URL, opening save dialog, " + docId);
              return global.webViewCookiesManager.getGrauth(function(grauth) {
                return utils.getFileName(e.url, grauth, function(filename) {
                  var dest, dialogRes, err, ok, opts;
                  opts = {
                    title: 'Export document as...',
                    defaultPath: filename ? filename : docId + '.txt',
                    filters: [
                      {
                        name: 'All Files',
                        extensions: ['*']
                      }
                    ]
                  };
                  dialogRes = dialog.showSaveDialog(remote.getCurrentWindow(), opts);
                  console.log("webView:new-window save dialog = " + dialogRes);
                  if (dialogRes) {
                    console.log("export: downloading doc to " + dialogRes);
                    dest = dialogRes;
                    ok = function(ok) {
                      return console.log("export: downloaded OK!");
                    };
                    err = function(err) {
                      console.log("export: download FAILED");
                      return dialog.showErrorBox('Grammarly', "There was a problem exporting your document.\nPlease try again later.");
                    };
                    return utils.downloadFileWithGrauth(e.url, dest, ok, err, grauth);
                  }
                });
              });
            } else {
              openInApp = config.regexp.httpsAppGrammarly.test(e.url);
              if (!openInApp) {
                console.log('webView:new-window -- opening in system browser');
                return shell.openExternal(e.url);
              } else {
                console.log('webView:new-window -- opening in SAME window');
                return _this.webviewEle.src = e.url;
              }
            }
          } catch (_error) {
            error = _error;
            return console.log("webView:new-window(" + e.url + ") failed: " + error.message);
          }
        };
      })(this));
      this.webviewEle.addEventListener('did-finish-load', (function(_this) {
        return function(e) {
          return console.log("webView:did-finish-load " + _this.webviewEle.src);
        };
      })(this));
      this.webviewEle.addEventListener('did-get-redirect-request', (function(_this) {
        return function(e) {
          var _ref1;
          console.log("webView:did-get-redirect-request " + e.oldURL + " -> " + e.newURL + ", isMainFrame? " + e.isMainFrame);
          if (e.isMainFrame) {
            if (config.regexp.subscribe.test(e != null ? e.newURL : void 0)) {
              console.log("webView:did-get-redirect-request => opening upgrade/subscribe url " + e.newURL + " in external");
              shell.openExternal(e.newURL);
            }
            if (!(e != null ? (_ref1 = e.newURL) != null ? _ref1.match(config.regexp.upgrade) : void 0 : void 0)) {
              _this.webviewEle.stop();
              return _this.emit('did-get-redirect-request', e);
            }
          }
        };
      })(this));
      this.webviewEle.addEventListener('will-navigate', (function(_this) {
        return function(e) {
          console.log(">>> webView:will-navigate " + e.url);
          _this.loadCommitUrl = e.url;
          if ((e != null ? e.url : void 0) === config.grammarly.signin || (e != null ? e.url : void 0) === config.grammarly.main) {
            _this.webviewEle.stop();
            return _this.emit('did-get-redirect-request');
          }
        };
      })(this));
      this.webviewEle.addEventListener('load-commit', (function(_this) {
        return function(e) {
          if (e.isMainFrame) {
            console.log(">>> webView:load-commit " + e.url);
            return _this.loadCommitUrl = e.url;
          }
        };
      })(this));
      this.webviewEle.addEventListener('did-start-loading', (function(_this) {
        return function(e) {
          var _ref1;
          console.log(">>> webView:did-start-loading, load-commit-url = " + _this.loadCommitUrl + ", webview src = " + _this.webviewEle.src);
          return _this.emit('did-start-loading', (_ref1 = _this.loadCommitUrl) != null ? _ref1 : _this.webviewEle.src);
        };
      })(this));
      this.webviewEle.addEventListener('did-stop-loading', (function(_this) {
        return function(e) {
          console.log("webView:did-stop-loading " + _this.webviewEle.src);
          return _this.emit('did-stop-loading', _this.webviewEle.src);
        };
      })(this));
      this.webviewEle.addEventListener('ipc-message', (function(_this) {
        return function(e) {
          switch (e.channel) {
            case 'webview-show-feedback':
              return _this.emit('show-feedback');
            default:
              return console.log("webView:ipc-message = unknown channel " + e.channel + " -> " + e.args);
          }
        };
      })(this));
      this.webviewEle.addEventListener('console-message', function(e) {
        return console.log("webView:CONSOLE=> " + e.message);
      });
      this.url = config.editorUrl;
    }

    EditorController.prototype.load = function(docId) {
      var newUrl;
      newUrl = docId != null ? "" + this.url + "docs/" + docId : this.url;
      console.log("Editor.load(" + docId + "): url is " + newUrl);
      this.subscribeWebViewDevToolsIfNeeded();
      if (!this.hasLoaded) {
        this.hasLoaded || (this.hasLoaded = true);
        return this.webview.attr({
          src: newUrl
        });
      } else {
        return this.webviewEle.executeJavaScript("document.location = '" + newUrl + "';");
      }
    };

    EditorController.prototype.stopLoading = function() {
      console.log("Editor.stopLoading :(");
      return this.webviewEle.stop();
    };

    EditorController.prototype.getOpenDevTools = function() {
      var _ref1, _ref2, _ref3;
      try {
        console.log("openDevTools is " + ((_ref1 = this.loadSettings) != null ? _ref1.openDevTools : void 0));
        return (_ref2 = (_ref3 = this.loadSettings) != null ? _ref3.openDevTools : void 0) != null ? _ref2 : false;
      } catch (_error) {
        console.log('cant get openDevTools');
        return false;
      }
    };

    EditorController.prototype.subscribeWebViewDevToolsIfNeeded = function() {
      try {
        if (this.openDevTools) {
          return this.once('did-start-loading', function(e) {
            return document.getElementsByTagName('webview')[0].openDevTools();
          });
        }
      } catch (_error) {
        return console.log('subscribeWebViewDevTools: cant subscirbe @editor on did-start-loading');
      }
    };

    return EditorController;

  })();

}).call(this);
