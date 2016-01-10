module.exports = exports = Backbone.View.extend({
  el: $('body'),
  initialize: function() {
    this.FacebookLogin = require('../accounts/login');
    this.loginBtn = $('.fb-login-btn');
    this.userInfoBtn = $('.user-info-btn');
  },

  events: {
    'click .fb-login-btn': 'logInOut',
  },
  logInOut: function() {
    var _this = this;
    var FacebookLoginInstance = _this.FacebookLogin;
    var loginBtn = _this.loginBtn;
    var userInfoBtn = _this.userInfoBtn;
    var userState = loginBtn.attr('data-status');

    if (userState === 'logout') {
      FacebookLoginInstance.loginUser(function(err, userData) {
        if (err) {
          alert('登入失敗');
        }
      });

      _this.setUserState('login');
    } else {
      // Login out user!
      FacebookLoginInstance.logoutUser();
      _this.setUserState('logout');
    }
  },

  checkUserState: function() {
    var _this = this;
    var FacebookLoginInstance = _this.FacebookLogin;
    var userInfoBtn = _this.userInfoBtn;
    var loginBtn = _this.loginBtn;

    FacebookLoginInstance.initFacebookSDK(function(err, userData) {
      console.log(err, userData);

      if (!err) {
        $.ajax({
          method: 'GET',
          url: `/get_user_info/${localStorage.getItem('uid')}`,
          success: function(response) {
            _this.fillInUserData(userData, response);
            _this.setUserState('login');
          },

          error: function(response) {
            console.log(response);
          },
        });
      } else {
        _this.setUserState('logout');
      }
    });
  },

  setUserState: function(state) {
    var _this = this;
    var userInfoBtn = _this.userInfoBtn;
    var loginBtn = _this.loginBtn;

    if (state === 'login') {
      loginBtn.html('<i class="fa fa-sign-out"></i> 登出').attr('data-status', 'login');
      userInfoBtn.removeClass('content-hidden');
    } else {
      loginBtn.html('<i class="fa fa-sign-in"></i> 登入').attr('data-status', 'logout');
      userInfoBtn.addClass('content-hidden');
    }
  },

  fillInUserData: function(userData, tagSet) {
    var tagContainer = $('.tag-container');
    $('.user-name').text(userData.name);
    $('.user-email').html(userData.email);
    $('.user-img').attr('src', userData.picture.data.url);

    tagContainer.html('');

    for (var tag of tagSet) {
      tagContainer.append(
      `<button class="btn btn-primary unsubscribe-btn" data-loading-text="取消訂閱中..." type="button" data-tag=${tag} style="margin: 4px;" autocomplete="off">
        <i class="fa fa-check-square-o"></i> ${tag}
      </button>`);
    }
  },
});
