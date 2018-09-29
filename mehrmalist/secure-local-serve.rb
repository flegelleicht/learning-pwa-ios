#!/usr/bin/env bundle exec ruby
#
# This code snippet shows how to enable SSL in Sinatra.
# Thank you to: https://gist.github.com/TakahikoKawasaki/40ef0ab011b0a467bedf#file-sinatra-ssl-rb

require 'sinatra/base'
require 'jwt'
require 'json'

class Application < Sinatra::Base
  class JwtAuth
    def initialize app
      @app = app
    end

    def call env
      begin
        if env.fetch('PATH_INFO', '') =~ /(^\/api\/v1$)/
          if env.fetch('PATH_INFO', '') !~ /\/login$/ 
            options = { algorithm: 'HS256', iss: ENV['MEHRMALIST_JWT_ISSUER'] }
            bearer = env.fetch('HTTP_AUTHORIZATION', '').slice(7..-1)
            puts "\n\n#{bearer}\n\n"
            payload, header = JWT.decode bearer, ENV['MEHRMALIST_JWT_SECRET'], true, options

            env[:scopes] = payload['scopes']
            env[:user] = payload['user']
          end
        end

        @app.call env
      rescue JWT::DecodeError
        [401, { 'Content-Type' => 'text/plain' }, ['A token must be passed.']]
      rescue JWT::ExpiredSignature
        [403, { 'Content-Type' => 'text/plain' }, ['The token has expired.']]
      rescue JWT::InvalidIssuerError
        [403, { 'Content-Type' => 'text/plain' }, ['The token does not have a valid issuer.']]
      rescue JWT::InvalidIatError
        [403, { 'Content-Type' => 'text/plain' }, ['The token does not have a valid "issued at" time.']]
      end
    end
  end
  
  use JwtAuth
  
  def initialize
    super
    @account = {
      "#{ENV['MEHRMALIST_USER']}" => "#{ENV['MEHRMALIST_PASS']}"
    }
  end
  
  configure do
    set :bind, '0.0.0.0'
    set :port, 3003
    enable :logging
  end

  before do
    begin
      request.body.rewind
      @req = JSON.parse request.body.read
    rescue JSON::ParserError
      @req = {}
      # halt 400, { 'Content-Type' => 'text/javascript' }, {message: 'Error in request json '}.to_json
    end
  end

  before /.*\.js/ do
    content_type 'text/javascript'
  end

  def token(user)
    JWT.encode payload(user), ENV['MEHRMALIST_JWT_SECRET'], 'HS256'
  end
  
  def payload(username)
    {
      exp: Time.now.to_i + 60 * 60,
      iat: Time.now.to_i,
      iss: ENV['MEHRMALIST_JWT_ISSUER'],
      scopes: ['get_state', 'add_change'],
      user: {
        username: username
      }
    }
  end

  get '/' do
    redirect '/index.html'
  end
  
  post '/api/v1/login' do
    user = @req['user']
    pass = @req['pass']

    if @account[user] == pass
      content_type :json
      { token: token(user)}.to_json
    else
      halt 401
    end
  end
  
  get '/api/v1/state' do
    content_type 'text/javascript'
    {}.to_json
  end

  def self.run!
    super do |server|
      server.ssl = true
      server.ssl_options = {
        :cert_chain_file  => File.dirname(__FILE__) + "/../template/server.crt",
        :private_key_file => File.dirname(__FILE__) + "/../template/server.key",
        :verify_peer      => false
      }
    end
  end

  run! if app_file == $0
end
