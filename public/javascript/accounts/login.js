module.exports = exports = {
  FB: {},
  callback: {},
  initFacebookSDK: function(callback) {
    var _this = this;

    window.fbAsyncInit = function() {
      _this.FB = FB;
      _this.FB.init({
        appId: '1517291225230751',
        xfbml: true,
        version: 'v2.5',
      });

      _this.callback = callback;
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
    var _this = this;
    if (r.status === 'connected') {
      _this.FB.api('/me', {fields: 'id, picture, email, first_name, middle_name, name'}, _this.getUserInfor.bind(_this));
    } else if (r.status === 'not_authorized') {
      _this.loginUser();
      console.log('Not authorized');
    } else {
      _this.loginUser();
      console.log('Not Login');
    }
  },

  getUserInfor: function(userData) {
    this.callback(userData);
  },

  logoutUser: function() {
    var _this = this;
    _this.FB.logout();
  },
};
