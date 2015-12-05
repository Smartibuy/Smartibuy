#configuration of testing
ENV['RACK_ENV'] = 'test'
Dir.glob('./{models,helpers,controllers,services,forms}/*.rb').each { |file| require file }
Dir.glob('./spec/pages/*.rb').each { |file| require file }

require 'minitest/autorun'
require 'rack/test'
require 'watir-webdriver'
require 'headless'
require 'page-object'

include Rack::Test::Methods

def app
  ApplicationController
end
