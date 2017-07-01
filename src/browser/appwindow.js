(function() {
  var AppWindow, BrowserWindow, EventEmitter, Menu, app, electron, fs, ipc, ipcMain, net, os, path, shell, url, _;

  electron = require('electron');

  Menu = electron.Menu, app = electron.app, ipcMain = electron.ipcMain, BrowserWindow = electron.BrowserWindow, shell = electron.shell;

  fs = require('fs');

  path = require('path');

  os = require('os');

  net = require('net');

  url = require('url');

  EventEmitter = require('events').EventEmitter;

  _ = require('underscore-plus');

  ipc = ipcMain;

  module.exports = AppWindow = (function() {
    _.extend(AppWindow.prototype, EventEmitter.prototype);

    function AppWindow(options) {
      var display, height, k, opts, scale, v, width, windowOpts, _ref, _ref1;
      this.loadSettings = {
        bootstrapScript: require.resolve('../renderer/main')
      };
      this.loadSettings = _.extend(this.loadSettings, options);
      windowOpts = {
        width: 1200,
        height: 675,
        show: false,
        'auto-hide-menu-bar': true,
        title: (_ref = options.title) != null ? _ref : "Grammarly",
        'web-preferences': {
          'subpixel-font-scaling': true,
          'direct-write': true
        }
      };
      if (process.platform === 'win32') {
        display = electron.screen.getPrimaryDisplay();
        scale = Math.max(display.scaleFactor, 1);
        _ref1 = display.workAreaSize, width = _ref1.width, height = _ref1.height;
        opts = {
          'min-width': parseInt(Math.min(870, width) / scale),
          'min-height': parseInt(Math.min(560, height) / scale)
        };
        console.log("AppWindow:constructor augmented window opts = " + ((function() {
          var _results;
          _results = [];
          for (k in opts) {
            v = opts[k];
            _results.push([k, v]);
          }
          return _results;
        })()));
        windowOpts = _.extend(windowOpts, opts);
      } else {
        windowOpts = _.extend(windowOpts, {
          'min-width': 870,
          'min-height': 560
        });
      }
      windowOpts = _.extend(windowOpts, this.loadSettings);
      console.log("BrowserWindow options: " + ((function() {
        var _results;
        _results = [];
        for (k in windowOpts) {
          v = windowOpts[k];
          _results.push("" + k + ":" + v);
        }
        return _results;
      })()));
      this.window = new BrowserWindow(windowOpts);
      this.window.on('closed', (function(_this) {
        return function(e) {
          return _this.emit('closed', e);
        };
      })(this));
      this.window.on('devtools-opened', (function(_this) {
        return function(e) {
          return _this.window.webContents.send('window:toggle-dev-tools', true);
        };
      })(this));
      this.window.on('devtools-closed', (function(_this) {
        return function(e) {
          return _this.window.webContents.send('window:toggle-dev-tools', false);
        };
      })(this));
      this.window.webContents.on('will-navigate', function(e, url, frameName, disposition) {
        console.log("@window:will-navigate " + e + ", " + url + ", " + frameName + ", " + disposition);
        return e.preventDefault();
      });
      this.window.webContents.on('new-window', function(e, url, frameName, disposition) {
        var error;
        console.log("@window:new-window " + e + ", " + url + ", " + frameName + ", " + disposition);
        e.preventDefault();
        try {
          return shell.openExternal(url);
        } catch (_error) {
          error = _error;
          return console.log("@window:new-window failed to open " + url + " in system browser: " + error);
        }
      });
      if (options.openDevTools) {
        this.toggleDevTools();
      }
    }

    AppWindow.prototype.show = function() {
      var targetPath, targetUrl;
      targetPath = path.resolve(__dirname, '..', '..', 'static', 'index.html');
      targetUrl = url.format({
        protocol: 'file',
        pathname: targetPath,
        slashes: true,
        query: {
          loadSettings: JSON.stringify(this.loadSettings)
        }
      });
      this.window.loadURL(targetUrl);
      return this.window.webContents.once('did-finish-load', (function(_this) {
        return function() {
          return _this.window.show();
        };
      })(this));
    };

    AppWindow.prototype.reload = function() {
      return this.window.webContents.reload();
    };

    AppWindow.prototype.toggleFullScreen = function() {
      return this.window.setFullScreen(!this.window.isFullScreen());
    };

    AppWindow.prototype.toggleDevTools = function() {
      return this.window.toggleDevTools();
    };

    AppWindow.prototype.close = function() {
      this.window.close();
      return this.window = null;
    };

    AppWindow.prototype.sendMessage = function(message, detail) {
      return this.window.webContents.send('message', message, detail);
    };

    AppWindow.prototype.bringToFront = function() {
      return this.window.show();
    };

    return AppWindow;

  })();

}).call(this);
