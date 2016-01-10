'use strict';

$(document).ready(function() {
  var FacebookLogin = require('./accounts/login');
  var LoginView = require('./backbone-view/login-view');
  var facebookLoginBtn = $('.fb-login-btn');

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
    duration: 4000,
  });

  var ProductView = Backbone.View.extend({
    el: $('#waterfall-container'),
    initialize: function() {
      this.mobilePage = 2;
      $(window).scroll(this.touchBottom.bind(this));
    },

    touchBottom: function() {
      var $cursorEle = $('.cursor');
      var $spinKiter = $('.sk-rotating-plane');
      var _this = this;
      var cursor = {
        page: $cursorEle.attr('data-page'),
        timestamp: $cursorEle.attr('data-timestamp'),
      };

      if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        $spinKiter.removeClass('content-hidden');
        var path = window.location.href.split('/')[3];

        if (path === 'mobile01') {

          $.ajax({
            method: 'GET',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            dataType: 'json',
            url: `/mobile01/${window.location.href.split('/')[4]}`,
            data: {
              page: this.mobilePage,
            },
            success: function(response) {
              var products = response;
              for (var p of products) {
                $('#main-container').append(_this.dealWithMobile01Html(p.price, p.link, p.num, p.name));
              }

              this.mobilePage = this.mobilePage + 1;
              $spinKiter.addClass('content-hidden');
            },

            error: function(response) {
              console.log('讀取錯誤，請重新整理');
              $spinKiter.addClass('content-hidden');
            },
          });

        } else {

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
              for (var p of products) {
                $('#main-container').append(_this.dealWithProductHtml(p.message ? p.message.replace(/\n/g,'<br/>') : '無敘述', p.price ? `${p.price} 元` : '尚無價格', p.comment_count, p.attachments[0]? p.attachments[0].src : 'http://placehold.it/320x150', p.origin_url, p.title ? p.title : '無產品名稱', p.from.name ? p.from.name : '無發佈者', p.id));
              }

              $cursorEle.attr({'data-timestamp': response.next.timestamp, 'data-page': response.next.page});
              $spinKiter.addClass('content-hidden');
            },

            error: function(response) {
              console.log('讀取錯誤，請重新整理');
              $spinKiter.addClass('content-hidden');
            },
          });
        }

      }
    },

    dealWithMobile01Html: function(price, url, comments, message) {
      return `<div class="well">
                  <div class="media">
                    <a class="pull-left" href="#">
                      <img class="media-object" src="http://placehold.it/320x150" width="320">
                    </a>
                    <div class="media-body">
                      <div class="panel panel-info">
                        <div class="panel-heading">
                          <h4 class="media-heading" style="display: inline-block;">
                            產品價格
                            <br/>
                            <span>
                              <i class="fa fa-money"></i> ${price}
                            </span>
                          </h4>
                          <a href=${url} class="btn btn-info pull-right" target="_blank">商品原網址</a>
                        </div>
                        <div class="panel-body">
                          <p>
                            ${message}
                          </p>
                          <ul class="list-inline list-unstyled">
                            <li>
                              <span><i class="fa fa-comment"></i> ${comments} 則留言</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
                `;
    },

    dealWithProductHtml: function(message, price, comments, imageUrl, url, title, user, id) {
      return `<div class="well" data-toggle="modal" data-good-id="${id}" data-target="#product-modal" style="cursor: pointer;">
                  <div class="media">
                    <a class="pull-left" href="#">
                      <img class="media-object" src="${imageUrl}" width="320">
                    </a>
                    <div class="media-body">
                      <div class="panel panel-info">
                        <div class="panel-heading">
                          <h4 class="media-heading" style="display: inline-block;">
                            <i class="fa fa-hand-o-right"></i> ${title}
                            <br/>
                            <span>
                              <i class="fa fa-money"></i> ${price}
                            </span>
                          </h4>
                          <a href=${url} class="btn btn-info pull-right" target="_blank">商品原網址</a>
                        </div>
                        <div class="panel-body">
                          <p class="text-right"><i class="fa fa-heart-o"></i> 來自 ${user} 朋友的好物!</p>
                          <p>
                            ${message}
                          </p>
                          <ul class="list-inline list-unstyled">
                            <li>
                              <span><i class="fa fa-comment"></i> ${comments} 則留言</span>
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

  loginView.checkUserState();

});
