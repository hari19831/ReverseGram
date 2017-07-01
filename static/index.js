
// Warning: You almost certainly do *not* want to edit this code - instead, you
// want to edit src/renderer/main.coffee instead
window.onload = function() {
  try {
    var startTime = Date.now();

    // hack around backspace navigation
    document.addEventListener("keydown", function (e) {
      if (e.which === 8
        && ((e.target || e.srcElement).tagName != "WEBVIEW")
        && ((e.target || e.srcElement).tagName != "TEXTAREA")
        && ((e.target || e.srcElement).tagName != "INPUT")) {
        e.preventDefault();
      }
    });

    // don't allow pinch-zoom
    document.addEventListener('mousewheel', function(e) {
      if(e.ctrlKey) {
        e.preventDefault();
      }
    });

    // Skip "?loadSettings=".
    var loadSettings = JSON.parse(decodeURIComponent(location.search.substr(14)));

    // Require before the module cache in dev mode
    if (loadSettings.devMode) {
      require('coffee-script').register();
      require('../src/babel').register();
    }

    require('vm-compatibility-layer');

    if (!loadSettings.devMode) {
      require('coffee-script').register();
      require('../src/babel').register();
    }

    require('../src/coffee-cache').register();

    window.loadSettings = loadSettings;

    require(loadSettings.bootstrapScript);
    require('electron').ipcRenderer.send('window-command', 'window:loaded');
  }
  catch (error) {
    var currentWindow = require('electron').remote.getCurrentWindow();
    currentWindow.setSize(800, 600);
    currentWindow.center();
    currentWindow.show();
    currentWindow.openDevTools();

    console.error(error.stack || error);
  }
};
