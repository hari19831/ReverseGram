// Code in this script is running in Renderer context.
(function(document) {
  var preload = function (document) {
    if (!String.prototype.trim) {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, "");
      };
    }

    var hackBackspaceNavigation = function () {
      // hack around backspace navigation
      document.addEventListener("keydown", function (e) {
        if (e.which === 8
          && ((e.target || e.srcElement).tagName != "IFRAME")
          && ((e.target || e.srcElement).tagName != "TEXTAREA")
          && ((e.target || e.srcElement).tagName != "INPUT")) {
          console.log("PREVENTING backspace navigation");
          e.preventDefault();
        }
      });
    };

    hackBackspaceNavigation();
  };

  // override userAgent, because EditorTS should identify DesktopEditor
  function hackUserAgent() {
    var remote = require('electron').remote;
    var appVersion = remote.require('../../package.json').version;
    var platform = { win32: 'windows', darwin: 'osx' }[remote.process.platform] || 'unknown';

    var userAgent = "Grammarly Desktop Editor ts0 " + appVersion + "-" + platform;
    navigator.__defineGetter__('userAgent', function () {
      return userAgent;
    });
  };

  document.addEventListener("DOMContentLoaded", function(event) {
    console.log('running preload script...');
    hackUserAgent();
    preload(document);
    console.log('<< preload script OK >>');
  });
})(document);
