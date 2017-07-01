(function() {
  var AppMenu, AppWindow, Application, AutoUpdateManager, BrowserWindow, EventEmitter, Menu, SingleInstance, app, config, fs, ipc, ipcMain, net, os, path, shell, spawn, url, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ref = require('electron'), Menu = _ref.Menu, BrowserWindow = _ref.BrowserWindow, app = _ref.app, ipcMain = _ref.ipcMain, shell = _ref.shell;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  net = require('net');

  url = require('url');

  config = require('./../config');

  EventEmitter = require('events').EventEmitter;

  _ = require('underscore-plus');

  spawn = require('child_process').spawn;

  AppMenu = require('./appmenu');

  AppWindow = require('./appwindow');

  AutoUpdateManager = require('./auto-update-manager');

  SingleInstance = require('./single-instance');

  ipc = ipcMain;

  module.exports = Application = (function() {
    _.extend(Application.prototype, EventEmitter.prototype);

    function Application(options) {
      this.removeAppWindow = __bind(this.removeAppWindow, this);
      this.resourcePath = options.resourcePath, this.version = options.version, this.devMode = options.devMode, this.filesToUpload = options.filesToUpload;
      global.application = this;
      this.pkgJson = require('../../package.json');
      this.windows = [];
      this.autoUpdateManager = new AutoUpdateManager(this.pkgJson.version, this.pkgJson.name);
      SingleInstance.listenForArgumentsFromNewProcess((function(_this) {
        return function(opts) {
          var firstWindow, pathToUpload;
          firstWindow = _.first(_this.windows);
          if (firstWindow != null) {
            pathToUpload = _.first(opts.filesToUpload);
            if (pathToUpload != null) {
              console.log("Application listenForArgumentsFromNewProcess ==> send upload-file message");
              firstWindow.sendMessage('application:upload-file', pathToUpload);
            }
            return firstWindow.bringToFront();
          } else {
            return _this.openWithOptions(opts);
          }
        };
      })(this));
      app.on('window-all-closed', function() {
        var _ref1;
        if ((_ref1 = process.platform) === 'win32' || _ref1 === 'linux') {
          return app.quit();
        }
      });
      app.on('activate-with-no-open-windows', (function(_this) {
        return function() {
          if (_this.windows.length === 0) {
            console.log("Application:on 'activate-with-no-open-windows' ==> OPENING new window");
            return _this.openWithOptions(options);
          } else {
            return console.log("Application:on 'activate-with-no-open-windows' -- IGNORING, already have at least one open window");
          }
        };
      })(this));
      app.on('open-file', (function(_this) {
        return function(event, pathToUpload) {
          console.log("Application:on 'open-file' => " + pathToUpload + " + " + _this.filesToUpload);
          event.preventDefault();
          return _this.uploadFile(pathToUpload, options);
        };
      })(this));
      app.on('open-url', (function(_this) {
        return function(event, urlToOpen) {
          var firstWindow;
          console.log("Application:on 'open-url' => " + urlToOpen);
          event.preventDefault();
          firstWindow = _.first(_this.windows);
          if (firstWindow != null) {
            return firstWindow.bringToFront();
          } else {
            return _this.openWithOptions(options);
          }
        };
      })(this));
      this.openWithOptions(options);
    }

    Application.prototype.openWithOptions = function(options) {
      var newWindow, test;
      test = options.test;
      if (test) {
        newWindow = this.openSpecsWindow(options);
      } else {
        newWindow = this.openWindow(options);
      }
      newWindow.show();
      this.windows.push(newWindow);
      newWindow.on('closed', (function(_this) {
        return function() {
          return _this.removeAppWindow(newWindow);
        };
      })(this));
      return newWindow.once('window:loaded', (function(_this) {
        return function() {
          return _this.autoUpdateManager.emitUpdateAvailableEvent(newWindow);
        };
      })(this));
    };

    Application.prototype.openSpecsWindow = function(_arg) {
      var bootstrapScript, devMode, error, exitWhenDone, isSpec, logFile, resourcePath, specDirectory;
      exitWhenDone = _arg.exitWhenDone, resourcePath = _arg.resourcePath, specDirectory = _arg.specDirectory, logFile = _arg.logFile;
      if (resourcePath !== this.resourcePath && !fs.existsSync(resourcePath)) {
        resourcePath = this.resourcePath;
      }
      try {
        bootstrapScript = require.resolve(path.resolve(global.devResourcePath, 'spec', 'spec-bootstrap'));
      } catch (_error) {
        error = _error;
        bootstrapScript = require.resolve(path.resolve(__dirname, '..', '..', 'spec', 'spec-bootstrap'));
      }
      isSpec = true;
      devMode = true;
      return new AppWindow({
        bootstrapScript: bootstrapScript,
        exitWhenDone: exitWhenDone,
        resourcePath: resourcePath,
        isSpec: isSpec,
        devMode: devMode,
        specDirectory: specDirectory,
        logFile: logFile
      });
    };

    Application.prototype.openWindow = function(options) {
      var appWindow, devMode;
      devMode = options.devMode;
      appWindow = new AppWindow(options);
      ipc.on('call-window-method', function() {
        var args, event, method, win;
        event = arguments[0], method = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        console.log("!!>> call-window-method: " + [event, method].concat(__slice.call(args)));
        win = BrowserWindow.fromWebContents(event.sender);
        return win[method].apply(win, args);
      });
      this.menu = new AppMenu({
        pkg: this.pkgJson,
        version: this.version,
        devMode: devMode
      });
      this.menu.attachToWindow(appWindow);
      this.menu.on('application:quit', function() {
        return app.quit();
      });
      if (process.platform === 'darwin') {
        this.menu.on('application:about', function() {
          return Menu.sendActionToFirstResponder('orderFrontStandardAboutPanel:');
        });
      }
      this.menu.on('application:report-issue', function() {
        return shell.openExternal(config.support.mainPage);
      });
      this.menu.on('window:reload', function() {
        return BrowserWindow.getFocusedWindow().reload();
      });
      this.menu.on('window:toggle-full-screen', function() {
        var focusedWindow, fullScreen;
        focusedWindow = BrowserWindow.getFocusedWindow();
        fullScreen = true;
        if (focusedWindow.isFullScreen()) {
          fullScreen = false;
        }
        return focusedWindow.setFullScreen(fullScreen);
      });
      this.menu.on('window:toggle-dev-tools', function() {
        return BrowserWindow.getFocusedWindow().toggleDevTools();
      });
      this.menu.on('application:run-specs', (function(_this) {
        return function() {
          return _this.openWithOptions({
            test: true
          });
        };
      })(this));
      this.menu.on('application:install-update', (function(_this) {
        return function() {
          return _this.autoUpdateManager.install();
        };
      })(this));
      this.menu.on('application:check-for-update', (function(_this) {
        return function() {
          return _this.autoUpdateManager.check();
        };
      })(this));
      return appWindow;
    };

    Application.prototype.removeAppWindow = function(appWindow) {
      var idx, w, _i, _len, _ref1, _results;
      _ref1 = this.windows;
      _results = [];
      for (idx = _i = 0, _len = _ref1.length; _i < _len; idx = ++_i) {
        w = _ref1[idx];
        if (w === appWindow) {
          _results.push(this.windows.splice(idx, 1));
        }
      }
      return _results;
    };

    Application.prototype.uploadFile = function(pathToUpload, options) {
      var firstWindow;
      firstWindow = _.first(this.windows);
      if (firstWindow != null) {
        console.log("Application uploadFile ==> send upload-file message");
        return firstWindow.sendMessage('application:upload-file', pathToUpload);
      } else {
        console.log("Application uploadFile ==> OPENING new window");
        options.filesToUpload = [pathToUpload];
        return this.openWithOptions(options);
      }
    };

    return Application;

  })();

}).call(this);
