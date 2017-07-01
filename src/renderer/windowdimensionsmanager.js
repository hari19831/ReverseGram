(function() {
  var WindowDimensionsManager, ipc, ipcRenderer, remote, _ref;

  _ref = require('electron'), ipcRenderer = _ref.ipcRenderer, remote = _ref.remote;

  ipc = ipcRenderer;

  module.exports = WindowDimensionsManager = (function() {
    function WindowDimensionsManager() {
      window.addEventListener('unload', (function(_this) {
        return function(e) {
          console.log('unload');
          return _this.storeDefaultWindowDimensions();
        };
      })(this));
    }

    WindowDimensionsManager.prototype.setSize = function(width, height) {
      return ipc.send('call-window-method', 'setSize', width, height);
    };

    WindowDimensionsManager.prototype.setPosition = function(x, y) {
      return ipc.send('call-window-method', 'setPosition', x, y);
    };

    WindowDimensionsManager.prototype.center = function() {
      return ipc.send('call-window-method', 'center');
    };

    WindowDimensionsManager.prototype.setFullScreen = function(fullScreen) {
      if (fullScreen == null) {
        fullScreen = false;
      }
      return ipc.send('call-window-method', 'setFullScreen', fullScreen);
    };

    WindowDimensionsManager.prototype.getCurrentWindow = function() {
      return remote.getCurrentWindow();
    };

    WindowDimensionsManager.prototype.getWindowDimensions = function() {
      var browserWindow, height, width, x, y, _ref1, _ref2;
      browserWindow = this.getCurrentWindow();
      _ref1 = browserWindow.getPosition(), x = _ref1[0], y = _ref1[1];
      _ref2 = browserWindow.getSize(), width = _ref2[0], height = _ref2[1];
      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
    };

    WindowDimensionsManager.prototype.setWindowDimensions = function(_arg) {
      var height, width, x, y;
      x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height;
      console.log("WindowDimensionsManager:setWindowDimensions (" + [x, y, width, height] + ")");
      if ((width != null) && (height != null)) {
        this.setSize(width, height);
      }
      if ((x != null) && (y != null)) {
        return this.setPosition(x, y);
      } else {
        return this.center();
      }
    };

    WindowDimensionsManager.prototype.isValidDimensions = function(_arg) {
      var height, width, x, y, _ref1;
      _ref1 = _arg != null ? _arg : {}, x = _ref1.x, y = _ref1.y, width = _ref1.width, height = _ref1.height;
      return width > 0 && height > 0;
    };

    WindowDimensionsManager.prototype.storeDefaultWindowDimensions = function() {
      var dimensions;
      dimensions = this.getWindowDimensions();
      console.log("WindowDimensionsManager:storeDefaultWindowDimensions (" + (JSON.stringify(dimensions)) + ")");
      if (this.isValidDimensions(dimensions)) {
        return localStorage.setItem("defaultWindowDimensions", JSON.stringify(dimensions));
      } else {
        return console.log("WindowDimensionsManager:storeDefaultWindowDimensions dimensions INVALID, ignoring");
      }
    };

    WindowDimensionsManager.prototype.getDefaultWindowDimensions = function() {
      var dimensions, error;
      dimensions = null;
      try {
        dimensions = JSON.parse(localStorage.getItem("defaultWindowDimensions"));
      } catch (_error) {
        error = _error;
        console.warn("Error parsing default window dimensions", error);
        localStorage.removeItem("defaultWindowDimensions");
      }
      if (this.isValidDimensions(dimensions)) {
        return dimensions;
      } else {
        return {
          width: 1200,
          height: 675
        };
      }
    };

    WindowDimensionsManager.prototype.restoreWindowDimensions = function() {
      var dimensions;
      dimensions = this.getDefaultWindowDimensions();
      console.log("WindowDimensionsManager:restoreWindowDimensions (" + (JSON.stringify(dimensions)) + ")");
      this.setWindowDimensions(dimensions);
      return dimensions;
    };

    return WindowDimensionsManager;

  })();

}).call(this);
