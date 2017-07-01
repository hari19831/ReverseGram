(function() {
  var $, NotConnectedView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  module.exports = NotConnectedView = (function(_super) {
    __extends(NotConnectedView, _super);

    function NotConnectedView() {
      return NotConnectedView.__super__.constructor.apply(this, arguments);
    }

    NotConnectedView.content = function() {
      return this.raw('<div class="connecting-screen">\n    <div class="connecting-wrap">\n        <div class="connect-icon"></div>\n        <div class="connect-msg">\n            <p>It appears you don’t have an Internet connection right now.</p>\n            <p>Grammarly will attempt to automatically reconnect.</p>\n        </div>\n        <button class="btn try-now" click=\'tryNow\' >Try now</button>\n    </div>\n</div>');
    };

    NotConnectedView.prototype.initialize = function(params) {
      return this.tryNowCallback = params.tryNowCallback;
    };

    NotConnectedView.prototype.tryNow = function() {
      return this.tryNowCallback();
    };

    return NotConnectedView;

  })(View);

}).call(this);
