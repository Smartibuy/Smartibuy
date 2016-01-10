module.exports = exports = {
  FB: {},
  callback: {},
  initFacebookSDK: function(callback) {
    var _this = this;
    console.log('init');

    // Loading Facebook SDK.
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
        // sandbox = 1536852743274599, production = 1517291225230751
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
    console.log('getting state;');
    _this.FB.getLoginStatus(_this.checkStatus.bind(_this));
  },

  loginUser: function() {
    var _this = this;
    _this.FB.login(_this.checkStatus.bind(_this), {scope: 'public_profile,email'});
  },

  checkStatus: function(r) {
    var _this = this;
    console.log('checking status');
    if (r.status === 'connected') {
      _this.FB.api('/me', {fields: 'id, picture, email, first_name, middle_name, name'}, _this.getUserInfor.bind(_this));
    } else if (r.status === 'not_authorized') {
      _this.callback(new Error('Not Authorized'));
    } else {
      _this.callback(new Error('Not Login'));
    }
  },

  getUserInfor: function(userData) {

    // Add user to dynamoid.
    $.ajax({
      method: 'POST',
      url: `/user_adder/${userData.id}`,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      data: {
        email: userData.email,
      },
      success: function(response) {
        console.log(response);
      },

      error: function(response) {
        console.log(response);
      },
    });

    this.callback(null, userData);
  },

  logoutUser: function() {
    this.FB.logout();
  },
};
