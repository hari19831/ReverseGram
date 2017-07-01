(function() {
  var $, LoginView, View, config, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  config = require('./../config');

  console.log('config', config);

  module.exports = LoginView = (function(_super) {
    __extends(LoginView, _super);

    function LoginView() {
      return LoginView.__super__.constructor.apply(this, arguments);
    }

    LoginView.content = function(params) {
      return this.raw('<div class="login-screen">\n    <div class="login">\n        <a class="logo"></a>\n        <h1 class="title">Member Login</h1>\n        <div class="not-member">\n          Not a member? <a href="' + config.grammarly.signup + '" target=\'_blank\' class="link">Sign up</a>\n</div>\n<div class="form">\n    <input type="email" class="input email" name="email"  placeholder="Email"/>\n    <input type="password" class="input password" name="password" placeholder="Password" />\n    <button class="btn submit" click="login">\n        <span class="btn-text">Log in to Grammarly</span>\n        <div class="loading-spinner">\n            <div class="loading-item"></div>\n            <div class="loading-item"></div>\n            <div class="loading-item"></div>\n        </div>\n    </button>\n</div>\n<div class="validation-msg"></div>\n<a href="' + config.grammarly.resetpassword + '" target=\'_blank\' class="link forgot-pass">Forgot password?</a>\n    </div>\n</div>');
    };

    LoginView.prototype.initialize = function(params) {
      this.errorMessageDiv = this.find('div.validation-msg');
      this.loginDiv = this.find('div.login');
      this.email = this.find('input[name=email]');
      this.password = this.find('input[name=password]');
      this.loginButton = this.find('button.btn submit');
      this.loginCallback = params.loginCallback;
      this.api = params.api;
      this.find('input').keydown((function(_this) {
        return function(e) {
          if (e.keyCode === 13) {
            return _this.login();
          }
        };
      })(this));
      if (localStorage.grammarlyEmail != null) {
        return this.email.val(localStorage.grammarlyEmail);
      }
    };

    LoginView.prototype.addErrorMessage = function(message) {
      return this.errorMessageDiv.html("<i>&mdash;</i>" + message);
    };

    LoginView.prototype.showError = function(message) {
      this.addErrorMessage(message);
      return this.loginDiv.addClass('invalid');
    };

    LoginView.prototype.hideError = function() {
      return this.loginDiv.removeClass('invalid');
    };

    LoginView.prototype.showProgress = function() {
      return this.loginDiv.addClass('loading');
    };

    LoginView.prototype.hideProgress = function() {
      return this.loginDiv.removeClass('loading');
    };

    LoginView.prototype.onLoginStart = function() {
      this.loginInProgress = true;
      this.email.attr('disabled', true);
      this.password.attr('disabled', true);
      this.loginButton.attr('disabled', true);
      this.hideError();
      return this.showProgress();
    };

    LoginView.prototype.onLoginFinish = function() {
      this.loginInProgress = false;
      this.email.attr('disabled', false);
      this.password.attr('disabled', false);
      this.loginButton.attr('disabled', false);
      return this.hideProgress();
    };

    LoginView.prototype.genericErrorMessage = 'An unexpected error has occurred while connecting to Grammarly. Please visit <a href="' + config.support.connectionTroubleshooting + '" target="_blank" class="link">this page</a> for more information.';

    LoginView.prototype.eduOldEditorErrorMessage = 'Your license is limited to the Grammarly Editor at <a href="' + config.grammarly.main + '" target="_blank" class="link">www.grammarly.com</a> only. If you have received this message in error, contact <a href="mailto:' + config.grammarly.mailto + '" target="_blank" class="link">support@grammarly.com</a>.';

    LoginView.prototype.freeUserErrorMessage = 'To access Grammarly on desktop, please upgrade your subscription at <a href="' + config.grammarly.upgrade + '" target="_blank" class="link">www.grammarly.com/upgrade</a>';

    LoginView.prototype.authErrorToErrorMessage = {
      'user_not_authorized': 'Username or password is invalid',
      'institution_license_discountinued': 'Your institution license has been discontinued',
      'user_disabled': 'Your account is disabled',
      'email_not_confirmed': 'Your e-mail address is not confirmed',
      'user_not_found': 'User with that username does not exist'
    };

    LoginView.prototype.login = function() {
      if (this.loginInProgress) {
        console.log("LoginView:login -- ALREADY logging in??");
        return;
      }
      localStorage.grammarlyEmail = this.email.val();
      if (this.email.val().trim() === '') {
        return this.showError('Please enter your Grammarly e-mail address');
      } else if (this.password.val().trim() === '') {
        return this.showError('Please enter your password');
      } else {
        this.onLoginStart();
        return this.api.login("" + (this.email.val()), "" + (this.password.val()), (function(_this) {
          return function(loginOk) {
            var k, v;
            console.log("LoginView:login = success, " + ((function() {
              var _results;
              _results = [];
              for (k in loginOk) {
                v = loginOk[k];
                _results.push([k, k === 'grauth' ? '******' : v]);
              }
              return _results;
            })()));
            if (loginOk.grauth != null) {
              console.log('LoginView:login -- GRAUTH EXISTS');
              return _this.api.user(loginOk.grauth, function(userOk) {
                if (userOk.institutionNewEditor === false) {
                  console.log("LoginView:login -- institutionNewEditor is FALSE");
                  _this.onLoginFinish();
                  return _this.showError(_this.eduOldEditorErrorMessage);
                } else if (userOk.free === true && userOk.freemium === false) {
                  console.log("LoginView:login -- free is TRUE and freemium is FALSE");
                  _this.onLoginFinish();
                  return _this.showError(_this.freeUserErrorMessage);
                } else if (userOk.anonymous === true) {
                  console.log("LoginView:login -- user is anonymous");
                  _this.onLoginFinish();
                  return _this.showError(_this.genericErrorMessage);
                } else {
                  if (_this.successfulLogin != null) {
                    _this.successfulLogin();
                  }
                  return global.webViewCookiesManager.setPersistentCookie('grauth', loginOk.grauth, function() {
                    _this.loginCallback(loginOk);
                    return _this.api.ensureUsedDesktopEditorTracking(loginOk.grauth, userOk);
                  });
                }
              }, function(userFail) {
                console.log("LoginView:login -- failed at api.user, " + userFail);
                _this.onLoginFinish();
                return _this.showError(_this.genericErrorMessage);
              });
            } else {
              console.log('LoginView:login -- NO GRAUTH');
              _this.onLoginFinish();
              return _this.showError(_this.genericErrorMessage);
            }
          };
        })(this), (function(_this) {
          return function(loginFail) {
            var message, _ref1;
            console.log("LoginView:login FAILED " + loginFail.error);
            _this.onLoginFinish();
            message = _this.authErrorToErrorMessage[loginFail.error] != null ? _this.authErrorToErrorMessage[loginFail.error] : (!navigator.onLine) || ((loginFail != null ? (_ref1 = loginFail.err) != null ? _ref1.code : void 0 : void 0) === 'ENOTFOUND') ? 'It appears that you are not connected to the Internet right now' : _this.genericErrorMessage;
            return _this.showError(message);
          };
        })(this));
      }
    };

    LoginView.prototype.show = function() {
      this.hideError();
      this.hideProgress();
      this.onLoginFinish();
      return LoginView.__super__.show.apply(this, arguments);
    };

    LoginView.prototype.clearPassword = function() {
      return this.password.val('');
    };

    return LoginView;

  })(View);

}).call(this);
