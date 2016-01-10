require 'sinatra/base'
require 'sinatra/flash'
require 'httparty'
require 'hirb'
require 'slim'

require 'chartkick'
require 'uri'
require 'time'
require 'json'

class ApplicationController < Sinatra::Base

  CATEGORY_LIST = ["電腦資訊", "手持通訊", "攝影器材", "數位家電", "休閒旅遊", "生活用品", "汽車", "機車", "自行車", "男性時尚", "女性流行", "代購與虛擬物品", "房屋地產"]
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
    puts results
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
    @results = HTTParty.get(request_url)
    @results["data"].to_json
  end

  get_mobile01_products = lambda do
    puts params[:page].to_s
    request_url = "#{settings.api_server}/#{settings.api_ver}/mobile01/" << URI.escape(params[:cate]) << "?page=" << params[:page].to_s
    results = HTTParty.get(request_url)

    results.each do |result|
      result["link"] = 'http://www.mobile01.com/' << result["link"]
      result
    end

    if params[:page].nil?
      @goodlist = results
      slim :mobile01
    else
      results.to_json
    end
  end

  statistic = lambda do
    u = URI.escape("http://smartibuyweb.herokuapp.com/api/v1/search_mobile01/手機/iphone/10/result.json")
    results = HTTParty.get(u)
    @chart_data = {}
    results.each do |result|
      @chart_data[result["name"]] = result["price"]
    end
    @chart_data
    slim :statistic
  end

  statistic_good = lambda do
    cate = params[:cate]
    good = params[:good]
    u = URI.escape("http://smartibuyweb.herokuapp.com/api/v1/search_mobile01/" << cate << "/" << good << "/10/result.json")
    results = HTTParty.get(u)
    @chart_data = {}
    results.each do |result|
      @chart_data[result["name"]] = result["price"]
    end
    @chart_data
    slim :statistic
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

  subscribe_hastag = lambda do
    request_url = '#{settings.api_server}/#{settings.api_ver}/update_user_date/' << params[:id]
    HTTParty.post(request_url,
                    :body => {
                      :email => params[:email],
                      :hashtag => params[:hashtag],
                    },
                    :headers => { 'Content-Type' => 'application/json' })
  end

  show_user_info = lambda do
    slim :user
  end

  hotcloud = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/hot/keyword"
    results = HTTParty.get(request_url)
    @keyword = JSON.parse(results)
    num = @keyword.size
    @time_to_key = {}
    @item = []
    @time = []
    for i in 0..num-1
      @time.push(Time.parse(@keyword[i]["time"]))
      @time_to_key["#{@keyword[i]["time"]}"] = @keyword[i]["key"]
      @key_num = @keyword[i]["key"].size
      @item.push(JSON.parse(@keyword[i]["key"]))
    end
    puts @item[0].size
    slim :hotcloud
  end


  search = lambda do
    i = params[:index].to_i - 1
    cate = CATEGORY_LIST[i]

    if params[:keyword] != nil
      KEYWORD = params[:keyword]
    end
    @keyword = KEYWORD

    url = "http://smartibuyapidynamo.herokuapp.com/api/v1/search_mobile01/" << cate << "/" << @keyword << "/10/result.json"
    puts url
    u = URI.escape(url)
    @goodlist = HTTParty.get(u)
    @cate = cate

    u1 = URI.escape('http://smartibuyapidynamo.herokuapp.com/api/v1/add_keyword_to_search_queue/'<<@keyword)
    HTTParty.post(u1, :headers => {'Content-Type' => 'application/json'})
    u2 = URI.escape('http://smartibuyapidynamo.herokuapp.com/api/v1/add_keyword_to_cate_queue/'<<cate)
    HTTParty.post(u2, :headers => {'Content-Type' => 'application/json'})

    slim :search
  end


  # Web App Views Routes
  get '/', &app_get_root
  get '/prodct-fetcher' , &fetch_prodocts
  get '/product/:id', &get_group_products
  get '/product_comment', &get_product_comments

  get '/mobile01/:cate', &get_mobile01_products

  get '/statistic', &statistic
  post '/statistic', &statistic_good

  get '/hashtag', &get_hashtag
  post '/subscriber', &subscribe_hastag

  get '/user', &show_user_info

  get '/search/:index', &search

  get '/hotcloud', &hotcloud

end
