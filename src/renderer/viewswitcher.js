(function() {
  var $, View, ViewSwitcher, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  module.exports = ViewSwitcher = (function(_super) {
    __extends(ViewSwitcher, _super);

    function ViewSwitcher() {
      return ViewSwitcher.__super__.constructor.apply(this, arguments);
    }

    ViewSwitcher.content = function(state) {
      return this.div({
        style: 'width:100%; height:100%;'
      }, (function(_this) {
        return function() {
          var k, v, _ref1;
          _this.a({
            outlet: 'focusAnchor1',
            href: '#',
            style: 'width: 0; height: 0; overflow: hidden;'
          });
          _ref1 = state.subviews;
          for (k in _ref1) {
            v = _ref1[k];
            _this.subview(k, v);
          }
          return _this.a({
            outlet: 'focusAnchor2',
            href: '#',
            style: 'width: 0; height: 0; overflow: hidden;'
          });
        };
      })(this));
    };

    ViewSwitcher.prototype.initialize = function(args) {
      var findFocusable, k, _;
      if (!((args.subviews != null) && typeof args.subviews === 'object' && ((function() {
        var _results;
        _results = [];
        for (_ in args.subviews) {
          _results.push(_);
        }
        return _results;
      })()).length > 0)) {
        throw new TypeError("intialize : { a | a.subviews : object, a.initialVisible : string? }");
      }
      this.subviews = args.subviews;
      findFocusable = function(jq) {
        return jq.find('a[href], area[href], input:not([disabled]), select:not([disabled]), ' + 'textarea:not([disabled]), button:not([disabled]), iframe, ' + 'object:not([disabled]), embed, *[tabindex], *[contenteditable]').filter(':visible');
      };
      this.focusAnchor1.on('focus', (function(_this) {
        return function(e) {
          console.log("ViewSwitcher -- 'almost' lost focust by shift-tabbing");
          e.preventDefault();
          return findFocusable(_this).filter(':last').focus();
        };
      })(this));
      this.focusAnchor2.on('focus', (function(_this) {
        return function(e) {
          console.log("ViewSwitcher -- 'almost' lost focust by tabbing");
          e.preventDefault();
          return findFocusable(_this).filter(':first').focus();
        };
      })(this));
      return this.switchTo(args.initialVisible || ((function() {
        var _ref1, _results;
        _ref1 = this.subviews;
        _results = [];
        for (k in _ref1) {
          _ = _ref1[k];
          _results.push(k);
        }
        return _results;
      }).call(this))[0]);
    };

    ViewSwitcher.prototype.attached = function() {
      return this.switchTo(this.currentVisible);
    };

    ViewSwitcher.prototype.switchTo = function(name) {
      var k, v, _ref1, _results;
      if (this.subviews[name] == null) {
        throw new Error("Subview " + name + " does not exist.");
      }
      this.currentVisible = name;
      _ref1 = this.subviews;
      _results = [];
      for (k in _ref1) {
        v = _ref1[k];
        if (k === name) {
          _results.push(v.show());
        } else {
          _results.push(v.hide());
        }
      }
      return _results;
    };

    ViewSwitcher.prototype.isVisible = function(name) {
      return name === this.currentVisible;
    };

    return ViewSwitcher;

  })(View);

}).call(this);
