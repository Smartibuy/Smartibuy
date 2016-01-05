(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(document).ready(function() {
  var FacebookLogin = require('./login');

  $('#waterfall-container').waterfall();
  $('#product-modal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var goodInfo = button.data('good-info').replace(/\n/g, '<br/>');
    var goodLink = button.data('link');
    var modal = $(this);

    modal.find('.panel-body').html(goodInfo);
    modal.find('.panel-heading a').attr('href', goodLink);
  });

  var LoginView = Backbone.View.extend({
    el: $('body'),
    events: {
      'click .fb-login-btn': 'login',
    },
    login: function() {
      FacebookLogin.initFacebookSDK();
    },
  });

  var loginView = new LoginView();

});

},{"./login":2}],2:[function(require,module,exports){
module.exports = exports = {
  FB: {},
  initFacebookSDK: function() {
    var _this = this;

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    window.fbAsyncInit = function() {
      _this.FB = FB;
      _this.FB.init({
        appId: '1517291225230751',
        xfbml: true,
        version: 'v2.5',
      });

      _this.getFacebookLoginState();
    };
  },

  getFacebookLoginState: function() {
    var _this = this;
    _this.FB.getLoginStatus(_this.checkStatus.bind(_this));
  },

  loginUser: function() {
    var _this = this;
    _this.FB.login(_this.checkStatus.bind(_this), {scope: 'public_profile,email'});
  },

  checkStatus: function(r) {
    console.log(r);
    var _this = this;
    if (r.status === 'connected') {
      _this.FB.api('/me', {fields: 'id, picture, email, first_name, middle_name, name'}, _this.getUserInfor);
    } else if (r.status === 'not_authorized') {
      _this.loginUser();
    } else {
      _this.loginUser();
    }
  },

  getUserInfor: function(userData) {
    console.log(userData);
  },

  logoutUser: function() {
    var _this = this;
    _this.FB.logout(function(res) {
      console.log(res);
    });
  },
};

},{}]},{},[1]);
