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

  // Register Product Modal
  $('#product-modal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var goodInfo = button.data('good-info').replace(/\n/g, '<br/>');
    var goodLink = button.data('link');
    var modal = $(this);

    // Upadte the description of a product.
    modal.find('.panel-body').html(goodInfo);
    modal.find('.panel-heading a').attr('href', goodLink);
  });

  // New ElevatorJS Instance
  new Elevator({
    element: document.querySelector('.up-arrow'),
    mainAudio: '../music/elevator.mp3',
    endAudio: '../music/ding.mp3',
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
            groupID: window.location.pathname.split('/')[2],
          },
          success: function(response) {
            var products = response.data;
            for (let p of products) {
              $('#main-container').append(_this.dealWithProductHtml(p.message ? p.message : '無敘述', p.price ? p.price : '尚無價格', p.comment_count, p.attachments[0]? p.attachments[0].src : 'http://placehold.it/320x150', p.origin_url, p.title ? p.title : '無產品名稱', p.from.name ? p.from.name : '無發佈者'));
            }

            $cursorEle.attr({'data-timestamp': response.next.timestamp, 'data-page': response.next.page});
          },

          error: function(response) {
            alert('讀取錯誤');
          },
        });
      }
    },

    dealWithProductHtml: function(message, price, comments, imageUrl, url, title, user) {
      return `<div class="well" data-toggle="modal" data-link=${url} data-target="#product-modal" data-good-info=${message} style="cursor: pointer;">
                  <div class="media">
                    <a class="pull-left" href="#">
                      <img class="media-object" src="${imageUrl}" width="320">
                    </a>
                    <div class="media-body">
                      <div class="panel panel-info">
                        <div class="panel-heading">
                          <h4 class="media-heading">${title}</h4>
                        </div>
                        <div class="panel-body">
                          <p class="text-right">來自-${user}</p>
                          <p>
                            ${message}
                          </p>
                          <ul class="list-inline list-unstyled">
                            <li>
                              <span><i class="fa fa-comment"></i>現在有${comments}則留言， </span>
                            </li>
                            <li>
                              <span><i class="fa fa-money"></i>價格${price} 元</span>
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
