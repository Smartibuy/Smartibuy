require 'sinatra/base'
require 'sinatra/flash'
require 'httparty'
require 'hirb'
require 'slim'

require 'fuzzystringmatch'
require 'chartkick'
require 'uri'
require 'time'
require 'json'

class ApplicationController < Sinatra::Base

  CATEGORY_LIST = ["電腦資訊", "手持通訊", "攝影器材", "數位家電", "休閒旅遊", "生活用品", "汽車", "機車", "自行車", "男性時尚", "女性流行", "代購與虛擬物品", "房屋地產"]
  GROUP_LIST = ['1049467665068019', '107793636088378',
                '1049467665068019', '144498012423141',
                '1603205203255905', '373766972786317',
                '817620721658179', '1491972361082561',
                '191505604299442']
  GROUP_NAME = ['桃竹苗跳蚤市場', '新竹二手跳蚤市場', '桃園中壢買賣',
                '大台南二手交流', '高雄二手買賣交流團', '高屏區二手買賣',
                '清交二手貨倉', '中教大二手買賣市場', '交大二手大賣場']
  KEYWORD = '筆電'

  enable :sessions
  register Sinatra::Flash
  use Rack::MethodOverride

  set :views, File.expand_path('../../views', __FILE__)
  set :public_folder, File.expand_path('../../public', __FILE__)

  configure do
    Hirb.enable
    set :session_secret, 'smartibuyisgood'
    set :api_ver, 'api/v1'
  end

  configure :test do
    set :api_server, 'http://localhost:9292'
  end

  configure :development, :production do
    set :api_server, 'http://smartibuyapidynamo.herokuapp.com'
  end

  configure :production, :development do
    enable :logging
  end

  helpers do
    def current_page?(path = ' ')
      path_info = request.path_info
      path_info += ' ' if path_info == '/'
      request_path = path_info.split '/'
      request_path[1] == path
    end
  end

  # =============
  # Web UI Routes
  # =============

  # Root Route
  app_get_root = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/107793636088378/goods"
    results = HTTParty.get(request_url)

    @goodlist = results["data"]
    @cursor = results["next"]
    slim :home
  end

  # Route for fetching products by page and timestamp.
  fetch_prodocts = lambda do
    content_type :json
    id = params[:groupID].nil? ? '107793636088378' : params[:groupID]

    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/" << id << "/goods?timestamp=#{params[:timestamp]}&page=#{params[:page]}"
    results = HTTParty.get(request_url)
    results.to_json
  end

  get_group_products = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/" << params[:id] << "/goods"
    results = HTTParty.get(request_url)

    @goodlist = results["data"]
    @cursor = results["next"]

    slim :home
  end

  get_product_comments = lambda do
    content_type :json
    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/goods/" << params[:id] << "/comments?action=" << params[:action]
    results = HTTParty.get(request_url)
    # puts results["data"], results["data"].class
    results["data"].to_json
  end

  get_mobile01_products = lambda do
    # puts params[:page].to_s
    request_url = "#{settings.api_server}/#{settings.api_ver}/mobile01/" << URI.escape(params[:cate]) << "?page=" << params[:page].to_s
    results = HTTParty.get(request_url)

    results.each do |result|
      result["link"] = 'http://www.mobile01.com/' << result["link"]
      result
    end

    if params[:page].nil?
      u = 'http://smartibuyapidynamo.herokuapp.com/api/v1/add_keyword_to_cate_queue/' << URI.escape(params[:cate])
      HTTParty.post(u, :headers => {'Content-Type' => 'application/json'})

      @tag = params[:cate]
      @goodlist = results
      slim :mobile01
    else
      results.to_json
    end
  end

  get_hashtag = lambda do
    JSON_URL = 'https://raw.githubusercontent.com/Smartibuy/shopee/master/lib/data/mobile_category.json'
    results = HTTParty.get(JSON_URL)
    json_tag = JSON.parse(results.body)

    @tag_arr = []

    json_tag.each do |k, v|
      @tag_arr.push(k)
    end

    slim :hashtag
  end

  get_cate_childs = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/mobile01_child/" << URI.escape(params[:cate])
    results = HTTParty.get(request_url)
    results.to_json
  end

  subscribe_hastag = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/users/" << params[:id] << "/tags/"
    # puts params[:hashtag], params[:id]
    HTTParty.post(request_url,
                    {
                      :body => {"tag" => params[:hashtag]}.to_json,
                      :headers => { 'Content-Type' => 'application/json' }
                    })
  end

  unsubscribe_tag = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/users/" << params[:id] << "/tags/" << URI.escape(params[:tag])
    results = HTTParty.delete(request_url)
    # puts results
  end

  add_user = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/users/" << params[:id]
    # puts request_url
    results = HTTParty.post(request_url,
                    {
                      :body => {"email" => params[:email]}.to_json,
                      :headers => { 'Content-Type' => 'application/json' }
                    })
    # puts results
  end

  get_user_info = lambda do
    content_type :json, charset: 'utf-8'

    request_url = "#{settings.api_server}/#{settings.api_ver}/users/" << params[:id]
    results = HTTParty.get(request_url)
    # puts results
    # puts results["hashtag"].to_json
    results["hashtag"].to_json
  end

  show_user_info = lambda do
    slim :user
  end

  hotcloud = lambda do
    request_url_keyword = "#{settings.api_server}/#{settings.api_ver}/hot/keyword"
    results_keyword = HTTParty.get(request_url_keyword)
    @keyword = JSON.parse(results_keyword)
    num = @keyword.size
    @time_key = []
    for i in 0..num-1
      @time_key.push(@keyword[i]["time"].split(' ')[0])
    end

    slim :hotcloud
  end

  hotcloud_data_key = lambda do
    content_type :json
    request_url_keyword = "#{settings.api_server}/#{settings.api_ver}/hot/keyword"
    results_keyword = HTTParty.get(request_url_keyword)
    results_keyword.to_json

  end

  hotcloud_data_cate = lambda do
    content_type :json
    request_url_cate = "#{settings.api_server}/#{settings.api_ver}/hot/cate"
    results_cate = HTTParty.get(request_url_cate)
    results_cate.to_json

  end


  search = lambda do
    i = params[:index].to_i - 1
    cate = CATEGORY_LIST[i]

    if params[:keyword] != nil
      KEYWORD = params[:keyword]
    end
    @keyword = KEYWORD

    url = "http://smartibuyapidynamo.herokuapp.com/api/v1/search_mobile01/" << cate << "/" << @keyword << "/10/result.json"
    # puts url
    u = URI.escape(url)
    @goodlist = HTTParty.get(u)
    @cate = cate

    u1 = URI.escape('http://smartibuyapidynamo.herokuapp.com/api/v1/add_keyword_to_search_queue/' << @keyword)
    HTTParty.post(u1, :headers => {'Content-Type' => 'application/json'})
    u2 = URI.escape('http://smartibuyapidynamo.herokuapp.com/api/v1/add_keyword_to_cate_queue/' << cate)
    HTTParty.post(u2, :headers => {'Content-Type' => 'application/json'})

    slim :search
  end

  search_fb = lambda do
    i = params[:index].to_i - 1
    group = GROUP_LIST[i]

    if params[:keyword] != nil
      KEYWORD = params[:keyword]
    end
    @keyword = KEYWORD
    @group = GROUP_NAME[i]

    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/" << group << "/goods"
    results = HTTParty.get(request_url)

    goods = results["data"]

    list_num = 5

    jarow = FuzzyStringMatch::JaroWinkler.create( :native )
    rank = {}
    goods.each do |good|
      value = 0
      if good['title'] != nil
        value = jarow.getDistance(good['title'] ,@keyword)
      end
      value2 = jarow.getDistance(good['message'] ,@keyword)

      if value2 > value
        value = value2
      end
      rank[good['message']] = value
    end

    rank_after_sort = Hash[rank.sort_by{|k, v| v}.reverse]
    key = rank_after_sort.keys()
    results = []
    for i in 0..list_num.to_i - 1
      good_name = key[i]
      goods.each do |good|
        if good['message'] == good_name
          results << good
          break
        end
      end
    end

    @results = results

    slim :search_fb
  end

  test_route = lambda do
    # Note:
    # the ajax success callabck will get a response which is `javascript object` if the result is hash or array.
    # the response will be a String if result is a string.
    content_type :json
    result = [{'name' => 'Calvin'}, {'name' => 'Calvins'}]
    result.to_json
  end

  # statistic = lambda do
  #   u = URI.escape("http://smartibuyweb.herokuapp.com/api/v1/search_mobile01/手機/iphone/10/result.json")
  #   results = HTTParty.get(u)
  #   @chart_data = {}
  #   results.each do |result|
  #     @chart_data[result["name"]] = result["price"]
  #   end
  #   @chart_data
  #   slim :statistic
  # end
  #
  # statistic_good = lambda do
  #   cate = params[:cate]
  #   good = params[:good]
  #   u = URI.escape("http://smartibuyweb.herokuapp.com/api/v1/search_mobile01/" << cate << "/" << good << "/10/result.json")
  #   results = HTTParty.get(u)
  #   @chart_data = {}
  #   results.each do |result|
  #     @chart_data[result["name"]] = result["price"]
  #   end
  #   @chart_data
  #   slim :statistic
  # end

  # Web App Views Routes
  get '/', &app_get_root
  get '/prodct-fetcher' , &fetch_prodocts
  get '/product/:id', &get_group_products
  get '/product_comment', &get_product_comments

  get '/mobile01/:cate', &get_mobile01_products
  get '/mobile01_child/:cate', &get_cate_childs
  delete '/unsubscribe/:id/:tag', &unsubscribe_tag
  # get '/statistic', &statistic
  # post '/statistic', &statistic_good

  get '/hashtag', &get_hashtag
  post '/subscriber/:id', &subscribe_hastag
  post '/user_adder/:id', &add_user
  get '/get_user_info/:id', &get_user_info

  get '/user', &show_user_info

  get '/search/:index', &search
  get '/search_fb/:index', &search_fb
  get '/test_route', &test_route

  get '/hotcloud', &hotcloud
  get '/hotcloudkey', &hotcloud_data_key
  get '/hotcloudcate', &hotcloud_data_cate

end
