Dir.glob('./{models,helpers,controllers}/*.rb').each { |file| require file }
require 'sinatra/activerecord/rake'
require 'rake/testtask'

task :default => [:spec]

desc 'Run specs'
Rake::TestTask.new(name=:spec) do |t|
  t.pattern = 'spec/*_spec.rb'
end
