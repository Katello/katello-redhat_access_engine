#!/usr/bin/env rake
begin
  require 'bundler/setup'
rescue LoadError
  puts 'You must `gem install bundler` and `bundle install` to run rake tasks'
end
begin
  require 'rdoc/task'
rescue LoadError
  require 'rdoc/rdoc'
  require 'rake/rdoctask'
  RDoc::Task = Rake::RDocTask
end

RDoc::Task.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'RedHatAccess'
  rdoc.options << '--line-numbers'
  rdoc.rdoc_files.include('README.rdoc')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

APP_RAKEFILE = File.expand_path("../test/dummy/Rakefile", __FILE__)
load 'rails/tasks/engine.rake'



Bundler::GemHelper.install_tasks

require 'rake/testtask'

Rake::TestTask.new(:test) do |t|
  t.libs << 'lib'
  t.libs << 'test'
  t.pattern = 'test/**/*_test.rb'
  t.verbose = false
end

desc 'Compile stand alone engine assets'
task 'assets:precompile:engine' do
  require 'sprockets'
  require 'sprockets/railtie'
  require 'uglifier'
  require 'sass/rails/compressor'
  require File.expand_path('../lib/red_hat_access', __FILE__)

  precompile = [
    'red_hat_access/articles.js',
    'red_hat_access/articles.css'
  ]

  env = Sprockets::Environment.new(RedHatAccess::Engine.root)
  env.js_compressor = Uglifier.new
  env.css_compressor = Sass::Rails::CssCompressor.new

  paths = [
    'app/assets/stylesheets',
    'app/assets/javascripts',
    'vendor/assets/javascripts',
    'vendor/assets/stylesheets',
  ]

  paths.each do |path|
    env.append_path(path)
  end

  target = File.join(RedHatAccess::Engine.root, 'public', 'assets')
  compiler = Sprockets::StaticCompiler.new(env,
    target,
    precompile,
    :manifest_path => File.join(target),
    :digest => true,
    :manifest => true)
  compiler.compile
end
task :default => :test
