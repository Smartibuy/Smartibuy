module.exports = exports = Backbone.View.extend({
  el: $('body'),
  events: {
    'click .fb-login-btn': 'logInOut',
  },
  logInOut: function() {
  },
});
