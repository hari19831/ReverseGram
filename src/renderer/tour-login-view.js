(function() {
  var $, LoginView, TourLoginView, View, config, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  LoginView = require('./login-view');

  config = require('./../config');

  module.exports = TourLoginView = (function(_super) {
    __extends(TourLoginView, _super);

    function TourLoginView() {
      return TourLoginView.__super__.constructor.apply(this, arguments);
    }

    TourLoginView.content = function(params) {
      return this.raw('<div class="tour-screen">\n    <div class="login-area">\n        <a class="logo"></a>\n        <div class="login-wrap">\n            <div class="not-member">\n              Not a member? <a href="' + config.grammarly.signup + '" target=\'_blank\' class="link">Sign up</a>\n</div>\n<div action="#" class="form">\n    <input type="email" class="input email" name="email"  placeholder="Email"/>\n    <input type="password" class="input password" name="password" placeholder="Password" />\n    <button class="btn submit" click="login">\n        Log in to Grammarly\n    </button>\n</div>\n<div class="validation-msg">Invalid email address/password combination.</div>\n<a href="' + config.grammarly.resetpassword + '" target=\'_blank\' class="link forgot-pass">Forgot password?</a>\n        </div>\n        <div class="tour-loading"></div>\n    </div>\n\n    <div class="tour-area">\n        <div class="tour-component">\n            <div class="arrow prev"><i></i></div>\n\n            <div class="screens-wrap">\n                <div class="screen screen-first">\n                    <div class="img"></div>\n                    <div class="text-wrap">\n                        <h3 class="title">Welcome to Grammarly</h3>\n                        <div class="text platform-osx">\n                            Let’s get started with Grammarly for Mac.\n                            <br/>Take a few moments to learn how\n                            <br/>this application works.\n                        </div>\n                        <div class="text platform-windows">\n                            Let’s get started with Grammarly for Windows.\n                            <br/>Take a few moments to learn how\n                            <br/>this application works.\n                        </div>\n                    </div>\n                </div>\n                <div class="screen screen-second">\n                    <div class="img"></div>\n                    <div class="text-wrap">\n                        <h3 class="title">Utilizing the Cloud</h3>\n                        <div class="text">\n                            All documents in your Grammarly account\n                            <br/>are stored in the cloud. There is nothing to save\n                            <br/>or to sync. It’s that easy.\n                        </div>\n                    </div>\n                </div>\n\n                <div class="screen screen-third">\n                    <div class="img"></div>\n                    <div class="text-wrap">\n                        <h3 class="title">Importing Text</h3>\n                        <div class="text">\n                            To import a document to Grammarly, simply\n                            <br/><span class="bold">drag a file</span> into the Grammarly app window.\n                            <br/>A simple copy and paste command also works.\n                        </div>\n                    </div>\n                </div>\n\n                <div class="screen screen-four">\n                    <div class="img"></div>\n                    <div class="text-wrap">\n                        <h3 class="title">Exporting Text</h3>\n                        <div class="text">\n                            To export a document from Grammarly,\n                            <br/>just click <span class="bold">Export</span> or you may copy and paste\n                            <br/>the text into a text editor of your choice.\n                        </div>\n                    </div>\n                </div>\n\n                <div class="screen screen-fifth">\n                    <div class="img"></div>\n                    <div class="text-wrap">\n                        <h3 class="title">You’re Ready to Write</h3>\n                        <div class="text">\n                            <span class="bold">Log in</span> on the left to access Grammarly.\n                            <br/>We hope it will be love at first type.\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class="arrow next"><i></i></div>\n            <div class="paginator">\n                <div class="page"></div>\n                <div class="page"></div>\n                <div class="page"></div>\n                <div class="page"></div>\n                <div class="page"></div>\n            </div>\n        </div>\n    </div>\n</div>');
    };

    TourLoginView.prototype.initialize = function(param) {
      var el, p, platformToCssName, toShow, _i, _len, _ref1, _results;
      TourLoginView.__super__.initialize.apply(this, arguments);
      this.loginDiv = this.find('div.login-area');
      platformToCssName = {
        darwin: 'osx',
        win32: 'windows'
      };
      toShow = platformToCssName[process.platform] || _.values(platformToCssName)[0];
      _ref1 = _.values(platformToCssName);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        p = _ref1[_i];
        el = this.find(".platform-" + p);
        if (toShow === p) {
          _results.push(el.show());
        } else {
          _results.push(el.hide());
        }
      }
      return _results;
    };

    TourLoginView.prototype.addErrorMessage = function(message) {
      return this.errorMessageDiv.html(message);
    };

    TourLoginView.prototype.loadScripts = function() {
      return window.loaded();
    };

    TourLoginView.prototype.successfulLogin = function() {
      console.log('setting tourWasSeen');
      return localStorage.setItem('tourWasSeen', true);
    };

    return TourLoginView;

  })(LoginView);

}).call(this);
