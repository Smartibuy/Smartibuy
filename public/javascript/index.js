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
