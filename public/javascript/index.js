'use strict';

$(document).ready(function() {
  var FacebookLogin = require('./accounts/login');
  var LoginView = require('./backbone-view/login-view');
  var facebookLoginBtn = $('.fb-login-btn');

  // Loading Facebook SDK.
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  $('#product-modal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var goodInfo = button.data('good-info').replace(/\n/g, '<br/>');
    var goodLink = button.data('link');
    var modal = $(this);

    modal.find('.panel-body').html(goodInfo);
    modal.find('.panel-heading a').attr('href', goodLink);
  });

  new Elevator({
    element: document.querySelector('.up-arrow'),
    mainAudio: '../music/windows.mp3',
    endAudio: '../music/mac.mp3',
    duration: 4000,
  });

  var ProductView = Backbone.View.extend({
    el: $('#waterfall-container'),
    initialize: function() {
      $(window).scroll(this.touchBottom.bind(this));
    },

    touchBottom: function() {
      var $cursorEle = $('.cursor');
      var _this = this;
      var cursor = {
        page: $cursorEle.attr('data-page'),
        timestamp: $cursorEle.attr('data-timestamp'),
      };

      if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        $.ajax({
          method: 'GET',
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          dataType: 'json',
          url: '/prodct-fetcher',
          data: {
            timestamp: cursor.timestamp,
            page: cursor.page,
          },
          success: function(response) {
            var products = response.data;
            for (let p of products) {
              $('#main-container').append(_this.dealWithProductHtml(p.message, 0, p.comment_count, p.attachments[0]? p.attachments[0].src :'http://placehold.it/320x150', p.origin_url));
            }

            $cursorEle.attr({'data-timestamp': response.next.timestamp, 'data-page': response.next.page});
          },

          error: function(response) {
            alert('讀取錯誤');
          },
        });
      }
    },

    dealWithProductHtml: function(message, price, comments, imageUrl, url) {
      return `<div class="well" data-toggle="modal" data-link=${url} data-target="#product-modal" data-good-info=${message} style="cursor: pointer;">
                  <div class="media">
                    <a class="pull-left" href="#">
                      <img class="media-object" src="${imageUrl}" width="320">
                    </a>
                    <div class="media-body">
                      <div class="panel panel-info">
                        <div class="panel-heading">
                          <h4 class="media-heading">Receta 1</h4>
                        </div>
                        <div class="panel-body">
                          <p class="text-right">來自 - </p>
                          <p>
                            ${message}
                          </p>
                          <ul class="list-inline list-unstyled">
                            <li>
                              <span><i class="glyphicon glyphicon-calendar"></i> 現在有${comments}則留言 </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
                `;
    },
  });

  var loginView = new LoginView();
  var productView = new ProductView();

});
