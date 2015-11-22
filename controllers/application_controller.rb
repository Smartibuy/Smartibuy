require 'sinatra/base'
require 'sinatra/flash'
require 'httparty'
require 'hirb'
require 'slim'


class ApplicationController < Sinatra::Base

  helpers GoodsHelpers
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

  configure :development, :test do
    set :api_server, 'http://localhost:9292'
  end

  configure :production do
    set :api_server, 'http://smartibuyweb.herokuapp.com'
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

  app_get_root = lambda do
    slim :home
  end

  app_get_group = lambda do
    # for 清交二手貨倉, id is 817620721658179.
    request_url = "#{settings.api_server}/#{settings.api_ver}/fb_data/" << params[:id] << ".json"
    results = HTTParty.get(request_url)
    @goodlist = results
    slim :goods_info
  end

  app_post_group =lambda do
    request_url = "#{settings.api_server}/#{settings.api_ver}/create_group"

    form = CreateGroupForm.new(params)
    result = CreateGroupFromAPI.new(request_url, form).call
    if (result.code != 200)
      flash[:notice] = 'Could not found service'
      redirect '/group'
      return nil
    end

    redirect "/group/#{result.group_id}"
  end

  create_group = lambda do
    slim :creategroup
  end

  search = lambda do
    slim :search
  end

  search_good_by_group = lambda do
    group_id = params[:group_id]
    puts 'Group id: ' << group_id
    redirect "/group/#{group_id}"
  end

  # Web App Views Routes
  get '/', &app_get_root
  get '/group/:id' , &app_get_group
  post '/group' ,&app_post_group
  get '/group', &create_group
  get '/search', &search
  post '/search', &search_good_by_group

end
