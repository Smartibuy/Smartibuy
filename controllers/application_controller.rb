require 'sinatra/base'
require 'sinatra/flash'
require 'httparty'
require 'hirb'
require 'slim'

require 'chartkick'
require 'uri'

class ApplicationController < Sinatra::Base

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
    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/817620721658179/goods"
    results = HTTParty.get(request_url)

    @goodlist = results["data"]
    @cursor = results["next"]

    slim :home
  end

  # Route for fetching products by page and timestamp.
  fetch_prodocts = lambda do
    content_type :json
    puts(params)

    id = params[:groupID].nil? ? '817620721658179' : params[:groupID]

    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/" << id << "/goods?timestamp=#{params[:timestamp]}&page=#{params[:page]}"
    results = HTTParty.get(request_url)
    puts(results["next"])
    results.to_json
  end

  get_group_products = lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/" << params[:id] << "/goods"
    results = HTTParty.get(request_url)

    @goodlist = results["data"]
    @cursor = results["next"]

    slim :home
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

  # Web App Views Routes
  get '/', &app_get_root
  get '/prodct-fetcher' , &fetch_prodocts
  get '/product/:id', &get_group_products

  get '/statistic', &statistic
  post '/statistic', &statistic_good

  get '/hashtag', &get_hashtag

end
