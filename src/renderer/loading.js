(function() {
  var $, LoadingView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  module.exports = LoadingView = (function(_super) {
    __extends(LoadingView, _super);

    function LoadingView() {
      return LoadingView.__super__.constructor.apply(this, arguments);
    }

    LoadingView.content = function(messageHtml) {
      if (messageHtml == null) {
        messageHtml = 'Grammarly Editor is loading';
      }
      return this.raw("<div class=\"loading-screen\" style='background-color:white; width:100%; height:100%;'>\n    <div class=\"editor__loading__center\">\n        <h4 class=\"editor__loading__title\">" + messageHtml + "</h4>\n        <div class=\"editor__loading__spinner\">\n            <div class=\"editor__loading__item\"></div>\n            <div class=\"editor__loading__item\"></div>\n            <div class=\"editor__loading__item\"></div>\n        </div>\n    </div>\n</div>");
    };

    return LoadingView;

  })(View);

}).call(this);
