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
