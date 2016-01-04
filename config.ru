require 'rack-livereload'

Dir.glob('./{models,helpers,controllers,services,forms}/*.rb').each { |file| require file }

run ApplicationController
use Rack::LiveReload
