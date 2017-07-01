(function() {
  var $, Api, FeedbackView, View, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  Api = require('./api');

  module.exports = FeedbackView = (function(_super) {
    __extends(FeedbackView, _super);

    function FeedbackView() {
      return FeedbackView.__super__.constructor.apply(this, arguments);
    }

    FeedbackView.content = function(args) {
      return this.raw('<div class="feedback-screen">\n    <div class="feedback">\n        <div class="form">\n            <button class="close-btn"></button>\n            <h3 class="title">Do You Love Our Desktop App?</h3>\n            <textarea autofocus required name="text" class="input textfield" placeholder="Tell us what you think…"></textarea>\n            <div class="info">Real humans will read and appreciate <br/> your feedback. Every comment helps!\n              <div class="validation-msg"></div>\n            </div>\n            <button type="button" class="btn submit" click="sendFeedback">\n                <span class="btn-text">Send</span>\n                <div class="loading-spinner">\n                    <div class="loading-item"></div>\n                    <div class="loading-item"></div>\n                    <div class="loading-item"></div>\n                </div>\n            </button>\n        </div>\n        <div class="success-result">\n            <div class="success-icon"></div>\n            <h2 class="title">Thank you for your feedback.</h2>\n            <div class="text">We look forward to reading it!</div>\n        </div>\n    </div>\n</div>');
    };

    FeedbackView.prototype.initialize = function(args) {
      this.api = args.api;
      this.onClose = args.onClose;
      this.feedbackForm = this.find('div.feedback > div.form');
      this.successResult = this.find('div.feedback > div.success-result');
      this.loginButton = this.find('div.feedback > div.form button.submit');
      this.textarea = this.find('div.feedback > div.form textarea');
      this.errorMessageDiv = this.find('div.validation-msg');
      this.find('.close-btn').on('click', (function(_this) {
        return function(e) {
          return _this.onClose();
        };
      })(this));
      return this.textarea.keydown((function(_this) {
        return function(e) {
          if (e.keyCode === 27) {
            return _this.onClose();
          }
        };
      })(this));
    };

    FeedbackView.prototype.showError = function(message) {
      this.errorMessageDiv.html(message);
      return this.feedbackForm.addClass('invalid');
    };

    FeedbackView.prototype.hideError = function() {
      return this.feedbackForm.removeClass('invalid');
    };

    FeedbackView.prototype.setLoading = function(isLoading) {
      if (isLoading) {
        this.loginButton.attr('disabled', true);
        this.textarea.attr('disabled', true);
        return this.feedbackForm.addClass('loading');
      } else {
        this.loginButton.attr('disabled', false);
        this.textarea.attr('disabled', false);
        return this.feedbackForm.removeClass('loading');
      }
    };

    FeedbackView.prototype.show = function(args) {
      this.hideError();
      this.feedbackForm.show();
      this.successResult.hide();
      this.setLoading(false);
      this.textarea.focus();
      return FeedbackView.__super__.show.apply(this, arguments);
    };

    FeedbackView.prototype.feedbackSentTimeoutMsec = 1550;

    FeedbackView.prototype.errorMessages = {
      feedbackIsEmpty: 'Please enter your feedback.',
      genericErrorMessage: 'There was a problem posting your feedback. Please try again later.'
    };

    FeedbackView.prototype.sendFeedback = function(e) {
      if (this.textarea.val() === '') {
        this.showError(this.errorMessages.feedbackIsEmpty);
        return;
      }
      this.setLoading(true);
      return this.api.sendFeedback({
        feedback: this.textarea.val(),
        email: localStorage.grammarlyEmail
      }, (function(_this) {
        return function(res) {
          console.log("FeedbackView:sendFeedback OK!");
          _this.setLoading(false);
          _this.feedbackForm.hide();
          _this.successResult.show();
          _this.textarea.val('');
          return setTimeout((function() {
            console.log('FeedbackView:hide form');
            return _this.onClose();
          }), _this.feedbackSentTimeoutMsec);
        };
      })(this), (function(_this) {
        return function(err) {
          _this.setLoading(false);
          _this.showError(_this.errorMessages.genericErrorMessage);
          return console.log("FeedbackView:sendFeedback -- FAILED, " + e);
        };
      })(this));
    };

    return FeedbackView;

  })(View);

}).call(this);
