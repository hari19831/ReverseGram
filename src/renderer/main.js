(function() {
  var $, Api, EditorController, FeedbackView, FileUploader, LoadingView, LoginView, MainController, NotConnectedView, TourLoginView, View, ViewSwitcher, WindowDimensionsManager, api, config, handleTryAuthFailed, handleTryAuthOk, mainController, retryAuthenticateDelayMsec, retryAuthenticateTimer, tryAuthenticate, windowDimensionsManager, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  Api = require('./api');

  ViewSwitcher = require('./viewswitcher');

  EditorController = require('./editor');

  LoginView = require('./login-view');

  TourLoginView = require('./tour-login-view');

  NotConnectedView = require('./notconnected');

  LoadingView = require('./loading');

  WindowDimensionsManager = require('./windowdimensionsmanager');

  FeedbackView = require('./feedback');

  FileUploader = require('./file-uploader');

  config = require('./../config');

  windowDimensionsManager = new WindowDimensionsManager();

  windowDimensionsManager.restoreWindowDimensions();

  global.webViewCookiesManager = require('./webviewcookiesmanager');

  api = new Api();

  MainController = (function() {
    MainController.prototype.editorStartLoadingTimeoutMsec = 15000;

    MainController.prototype.editorFinishLoadingTimeoutMsec = 60000;

    function MainController(_arg) {
      var err, loadSettings, loginViewClass, overlayViewTarget;
      overlayViewTarget = _arg.overlayViewTarget;
      this.updateOfflineStatus = __bind(this.updateOfflineStatus, this);
      console.log('MainController:constructor');
      loadSettings = (function() {
        try {
          return JSON.parse(decodeURIComponent(location.search.substr(14)));
        } catch (_error) {
          err = _error;
          return {};
        }
      })();
      this.overlayContainer = overlayViewTarget;
      loginViewClass = localStorage.tourWasSeen ? LoginView : TourLoginView;
      this.loginView = new loginViewClass({
        api: api,
        loginCallback: (function(_this) {
          return function(e) {
            var handleDidStartLoading, handleDidStopLoading, initLoadTimeout, showLoginError, th;
            console.log("MainController:login LOGGED IN, loading editor");
            _this.loginState = 'idle';
            th = null;
            showLoginError = function(msg) {
              console.log("MainController:login:showLoginError (" + msg + ")");
              _this.loginState = 'error';
              if (th != null) {
                clearTimeout(th);
              }
              _this.editor.off('did-stop-loading', handleDidStopLoading);
              _this.editor.off('did-start-loading', handleDidStartLoading);
              _this.editor.stopLoading();
              _this.showOverlay('login');
              _this.viewSwitcher.login.hideProgress();
              return _this.viewSwitcher.login.showError('We had a problem logging you in. Please try again later');
            };
            initLoadTimeout = function(t, unexpectedStates) {
              console.log("MainController:login//initLoadTimeout -- expecting @loginState to be not any of " + unexpectedStates + " in " + t + " msec.");
              if (th != null) {
                clearTimeout(th);
              }
              return th = setTimeout((function() {
                var _ref1;
                if (_ref1 = _this.loginState, __indexOf.call(unexpectedStates, _ref1) >= 0) {
                  console.log("MainController:login//initLoadTimeout -- *** @loginState was unexpectedly " + _this.loginState + " after " + t + " msec.");
                  return showLoginError();
                }
              }), t);
            };
            handleDidStopLoading = function(loc) {
              console.log("MainController:login editor LOADED at " + loc);
              if (th != null) {
                clearTimeout(th);
              }
              if (_this.loginState === 'did-start-loading') {
                _this.loginState = 'did-stop-loading';
                if (config.regexp.appGrammarly.test(loc)) {
                  return _this.showEditorNoLoad();
                } else {
                  console.log("MainController:login did-stop-loading " + loc + " ???!!");
                  return showLoginError();
                }
              } else {
                return console.log("MainController:login did-stop-loading in INVALID STATE: " + _this.loginState);
              }
            };
            handleDidStartLoading = function(loc) {
              console.log("MainController:login ...editor loading, " + loc);
              if (th != null) {
                clearTimeout(th);
              }
              if (_this.loginState === 'idle') {
                _this.loginState = 'did-start-loading';
                initLoadTimeout(_this.editorFinishLoadingTimeoutMsec, ['idle', 'did-start-loading']);
                if (config.regexp.appGrammarly.test(loc)) {
                  return _this.editor.once('did-stop-loading', handleDidStopLoading);
                } else {
                  console.log("MainController:login did-start-loading " + loc + " ???");
                  return showLoginError();
                }
              } else {
                return console.log("MainController:login did-start-loading in INVALID STATE: " + _this.loginState);
              }
            };
            _this.editor.once('did-start-loading', handleDidStartLoading);
            _this.editor.load();
            return initLoadTimeout(_this.editorStartLoadingTimeoutMsec, ['idle']);
          };
        })(this)
      });
      this.viewSwitcher = new ViewSwitcher({
        subviews: {
          login: this.loginView,
          'uploading-file': new LoadingView('Importing document to Grammarly&hellip;'),
          connecting: new LoadingView(),
          'not-connected': new NotConnectedView({
            tryNowCallback: function(e) {
              return tryAuthenticate(handleTryAuthOk, handleTryAuthFailed);
            }
          }),
          feedback: new FeedbackView({
            onClose: (function(_this) {
              return function() {
                return _this.showEditorNoLoad();
              };
            })(this),
            api: new Api()
          })
        },
        initialVisible: 'connecting'
      });
      this.$webview = $('#the-webview');
      this.webview = document.getElementById('the-webview');
      this.editor = new EditorController(this.$webview, this.webview, loadSettings);
      this.editor.on('did-get-redirect-request', (function(_this) {
        return function(e) {
          console.log('MainView:@editorView:did-get-redirect-request -- `logging out`');
          _this.viewSwitcher.subviews.login.clearPassword();
          global.webViewCookiesManager.clearGrauth();
          return _this.showOverlay('login');
        };
      })(this));
      this.editor.once('did-start-loading', function(e) {
        var osName, uaString, version;
        version = require('../../package.json').version;
        osName = {
          win32: 'windows',
          darwin: 'osx'
        }[process.platform] || 'unknown';
        uaString = "Grammarly Desktop Editor ts0 " + version + "-" + osName;
        console.log(">>> Setting user agent string to '" + uaString + "'");
        return document.querySelector('webview').setUserAgent(uaString);
      });
      this.editor.on('show-feedback', (function(_this) {
        return function(e) {
          console.log('MainView:@editorView:show-feedback');
          return _this.showOverlay('feedback');
        };
      })(this));
      this.fileUploader = new FileUploader(api, global.webViewCookiesManager, loadSettings, function() {
        return mainController.showOverlay('uploading-file');
      }, function(docId) {
        console.log("MainController: upload FINISHED, docId: " + docId);
        if (docId != null) {
          return mainController.showEditor(docId);
        } else {
          return mainController.showEditorNoLoad();
        }
      });
    }

    MainController.prototype.hookUp = function() {
      console.log("MainView:hookUp = " + this.overlayContainer);
      this.overlayContainer.empty().append(this.viewSwitcher);
      if (this.loginView.loadScripts != null) {
        this.loginView.loadScripts();
      }
      return window.addEventListener('offline', this.updateOfflineStatus);
    };

    MainController.prototype.updateOfflineStatus = function() {
      if (!navigator.onLine) {
        window.removeEventListener('offline', this.updateOfflineStatus);
        if (this.viewSwitcher.isVisible('connecting')) {
          return mainController.showOverlay('not-connected');
        }
      }
    };

    MainController.prototype.showEditor = function(docId) {
      console.log("MainView:showEditor " + docId);
      this.overlayContainer.hide();
      return this.editor.load(docId);
    };

    MainController.prototype.showEditorNoLoad = function(docId) {
      console.log("MainView:showEditorNoLoad " + docId);
      return this.overlayContainer.hide();
    };

    MainController.prototype.showOverlay = function(name) {
      console.log("MainView:showOverlay (" + name + ")");
      this.overlayContainer.show();
      if (name != null) {
        return this.viewSwitcher.switchTo(name);
      }
    };

    return MainController;

  })();

  retryAuthenticateTimer = null;

  retryAuthenticateDelayMsec = 1000;

  tryAuthenticate = function(okCallback, failCallback) {
    console.log('Trying to connect/authenticate...');
    if (retryAuthenticateTimer != null) {
      clearTimeout(retryAuthenticateTimer);
    }
    if (!navigator.onLine) {
      return failCallback('not-connected');
    } else {
      mainController.showOverlay('connecting');
      return global.webViewCookiesManager.migrateGrauth(function() {
        return global.webViewCookiesManager.getGrauth(function(grauth) {
          if ((grauth != null) && grauth !== '') {
            return api.user(grauth, function(ok) {
              console.log("tryAuthenticate:api.user OK");
              if ((ok && ok.email) && (!(ok.institutionNewEditor === false) && (!ok.anonymous))) {
                okCallback(grauth);
                return api.ensureUsedDesktopEditorTracking(grauth, ok);
              } else {
                return failCallback('auth-failed');
              }
            }, function(fail) {
              var k, v, _ref1;
              console.log("tryAuthenticate:api.user FAIL -> " + ((function() {
                var _results;
                _results = [];
                for (k in fail) {
                  v = fail[k];
                  _results.push([k, v]);
                }
                return _results;
              })()));
              if ((!navigator.onLine) || (fail != null ? (_ref1 = fail.err) != null ? _ref1.code : void 0 : void 0) === 'ENOTFOUND') {
                return failCallback('not-connected');
              } else {
                return failCallback('auth-failed');
              }
            });
          } else {
            return failCallback('not-authenticated');
          }
        });
      });
    }
  };

  handleTryAuthOk = function(grauth) {
    var fileUploader;
    console.log("global.handleTryAuthOk");
    fileUploader = mainController.fileUploader;
    if (fileUploader.onStartPathToUpload != null) {
      console.log("global.handleTryAuthOk -- will TRY TO UPLOAD " + fileUploader.onStartPathToUpload);
      mainController.showOverlay('uploading-file');
      return fileUploader.uploadFile(grauth, fileUploader.onStartPathToUpload, function(docId) {
        console.log("global.handleTryAuthOk -- upload SUCCESS, docId: " + docId);
        if (docId != null) {
          return mainController.showEditor(docId);
        } else {
          return mainController.showEditor();
        }
      }, function(err, resp, exc) {
        var k, v;
        console.log("global.handleTryAuthOk *** upload FAILED: " + err + ", " + ((function() {
          var _results;
          _results = [];
          for (k in resp) {
            v = resp[k];
            _results.push([k, v]);
          }
          return _results;
        })()) + ", " + exc);
        if (err === 'unsupported-format') {
          return fileUploader.showMessageBadExtension(function() {
            return mainController.showEditor();
          });
        } else if ((exc != null ? exc.code : void 0) === 'ENOENT') {
          return fileUploader.showMessageFileNotFound(function() {
            return mainController.showEditor();
          });
        } else {
          return fileUploader.showMessageThereWasAProblem(function() {
            return mainController.showEditor();
          });
        }
      });
    } else {
      console.log("global.handleTryAuthOk -- nothing to upload, just showing the editor");
      return mainController.showEditor();
    }
  };

  handleTryAuthFailed = function(failReason) {
    var fileUploader;
    console.log("global.handleTryAuthFailed: " + failReason);
    fileUploader = mainController.fileUploader;
    if (fileUploader.onStartPathToUpload != null) {
      fileUploader.onStartPathToUpload = null;
      switch (failReason) {
        case 'not-connected':
          return fileUploader.showMessageThereWasAProblem(function() {
            mainController.showOverlay('not-connected');
            return retryAuthenticateTimer = setTimeout((function() {
              return tryAuthenticate(handleTryAuthOk, handleTryAuthFailed);
            }), retryAuthenticateDelayMsec);
          });
        case 'not-authenticated':
          return fileUploader.showMessageNotLoggedIn(function() {
            return mainController.showOverlay('login');
          });
        case 'auth-failed':
          return fileUploader.showMessageThereWasAProblem(function() {
            return mainController.showOverlay('login');
          });
        default:
          return fileUploader.showMessageThereWasAProblem(function() {
            return mainController.showOverlay('login');
          });
      }
    } else {
      switch (failReason) {
        case 'not-connected':
          mainController.showOverlay('not-connected');
          return retryAuthenticateTimer = setTimeout((function() {
            return tryAuthenticate(handleTryAuthOk, handleTryAuthFailed);
          }), retryAuthenticateDelayMsec);
        default:
          return mainController.showOverlay('login');
      }
    }
  };

  mainController = new MainController({
    overlayViewTarget: $('#overlay-container')
  });

  mainController.hookUp();

  global.mainController = mainController;

  tryAuthenticate(handleTryAuthOk, handleTryAuthFailed);

}).call(this);
