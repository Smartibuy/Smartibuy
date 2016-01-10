'use strict';

$(document).ready(function() {
  var FacebookLogin = require('./accounts/login');
  var LoginView = require('./backbone-view/login-view');
  var ProductView = require('./backbone-view/product-view');
  var facebookLoginBtn = $('.fb-login-btn');

  $.ajax({
    method: 'GET',
    dataType: 'json',
    url: '/test_route',
    success: function(response) {
      console.log(response);
    },

    error: function(response) {
      console.log(response);
    },
  });

  // Register Product Modal
  $('#product-modal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var modal = $(this);
    var id = button.data('good-id');
    console.log(id);
    $.ajax({
      method: 'GET',
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      dataType: 'json',
      url: '/product_comment',
      data: {
        id: id,
        action: 'after',
      },
      success: function(response) {
        $('.list-group').html('');
        response = JSON.parse(response);

        if (response.length === 0) {
          $('.list-group').append('<li class="list-group-item">無留言</li>');
        }

        for (var comments of response) {
          $('.list-group').append(`<li class="list-group-item"><img src="${comments.from.picture.url}"/> ${comments.from.name} 說: ${comments.message}</li>`);
        }

      },

      error: function(response) {
        console.log(response);
      },
    });
  });

  // New ElevatorJS Instance
  new Elevator({
    element: document.querySelector('.up-arrow'),
    mainAudio: '../music/elevator.mp3',
    endAudio: '../music/ding.mp3',
    duration: 10000,
  });

  var loginView = new LoginView();
  var productView = new ProductView();

  loginView.checkUserState();

});
