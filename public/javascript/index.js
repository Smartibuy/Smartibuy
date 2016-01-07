$(document).ready(function() {
  var FacebookLogin = require('./accounts/login');
  var facebookLoginBtn = $('.fb-login-btn');

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

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
      'click .fb-login-btn': 'logInOut',
    },
    logInOut: function() {
    },
  });

  var loginView = new LoginView();
});
