module.exports = exports = Backbone.View.extend({
  el: $('body'),
  initialize: function() {
    this.mobilePage = 2;
    this.mainCate = ['電腦資訊', '手持通訊', '攝影器材', '數位家電', '休閒娛樂', '生活用品', '汽車', '機車', '自行車', '男性時尚', '女性流行', '代購與虛擬物品', '房屋地產'];

    $(window).scroll(this.touchBottom.bind(this));
    if (window.location.pathname.split('/')[1] === 'mobile01') {
      this.fillSubCate();
    }
  },

  events: {
    'click .subscribe-btn': 'subscribeTag',
    'click .unsubscribe-btn': 'unsubscribeTag',
  },

  fillSubCate: function() {
    // console.log($(''));
    var cate = $('.mobile01-dropdown').text().trim();
    console.log(cate);
    $.ajax({
      method: 'GET',
      url: `/mobile01_child/${cate}`,
      dataType: 'json',
      success: function(response) {
        var innerDropdown = $('.mobile01-dropdown-menu');

        if (this.mainCate.indexOf(cate) < 0) {
          $('.mobile01-dropdown').addClass('content-hidden');
        }else {
          // the cate eixts in the array, so index >= 0;
          $('.mobile01-dropdown').removeClass('content-hidden');
        }

        innerDropdown.html('');
        response.forEach(function(e) {
          innerDropdown.append(`<li><a href="/mobile01/${Object.keys(e)[0]}">${Object.keys(e)[0]}</a></li>`);
        });
      }.bind(this),

      error: function(response) {
        console.log(response);
      },
    });
  },

  subscribeTag: function(e) {
    var tag = $(e.target).data('tag');
    $.ajax({
      method: 'POST',
      url: `/subscriber/${localStorage.getItem('uid')}`,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      data: {
        hashtag: tag,
      },

      success: function(response) {
        alert('訂閱成功!');
        console.log(response);
      },

      error: function(response) {
        console.log(response);
      },
    });
  },

  unsubscribeTag: function(e) {
    console.log('un');
    var tag = $(e.target).data('tag');
    $.ajax({
      method: 'DELETE',
      url: `/unsubscribe/${localStorage.getItem('uid')}/${tag}`,

      success: function(response) {
        alert('取消訂閱成功!');
        console.log(response);
        location.reload();
      },

      error: function(response) {
        console.log(response);
      },
    });
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
              $('#main-container').append(_this.dealWithMobile01Html(p.price, p.link, p.num, p.name, decodeURI(window.location.href.split('/')[4])));
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

  dealWithMobile01Html: function(price, url, comments, message, tag) {
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
                        <a href=${url} class="btn btn-info pull-right" target="_blank">看更詳細!</a>
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
                        <button class="btn btn-primary subscribe-btn" type="button" data-tag=${tag} style="margin: 4px;">
                          <i class="fa fa-check-square-o"></i> ${tag}
                        </button>
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
                        <a href=${url} class="btn btn-info pull-right" target="_blank">看更詳細!</a>
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
