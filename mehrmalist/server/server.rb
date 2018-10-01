require 'sinatra/base'
require_relative './jwtauth'

class Server < Sinatra::Base
  
  use JwtAuth
  
  configure do
    set :server, 'thin'
    set :port, 61399
    set :logging, true
  end

  def initialize
    super
    
    Sequel.sqlite(File.dirname(__FILE__) + "/db/database.db")
    require_relative './db/models/user'
    require_relative './db/models/update'
    
    @account = {
      "#{ENV['MEHRMALIST_USER']}" => "#{ENV['MEHRMALIST_PASS']}"
    }
    @@updates = {}
    @@connections = {};
  end
  
  configure do
    set :bind, '0.0.0.0'
    set :port, 3003
    enable :logging
  end

  before do
    begin
      request.body.rewind
      @rawJsonBody = request.body.read
      @req = JSON.parse @rawJsonBody
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
  
  def payload(user)
    {
      exp: Time.now.to_i + 60 * 60 * 24,
      iat: Time.now.to_i,
      iss: ENV['MEHRMALIST_JWT_ISSUER'],
      scopes: ['get_state', 'add_change'],
      user: {
        id: user.id
      }
    }
  end

  get '/' do
    redirect '/index.html'
  end
  
  post '/api/v1/login' do
    login = @req['user']
    passw = @req['pass']

    user = User.find(login: login)

    if user and user.authenticate?(passw)
      content_type :json
      { token: token(user)}.to_json
    else
      halt 401
    end
  end
  
  get '/api/v1/state' do
    pp request.env
    content_type 'text/javascript'
    {message: 'Here’s your state'}.to_json
  end
  
  # FROM https://gist.github.com/rkh/1476463
  get '/api/v1/updatestream', provides: 'text/event-stream' do
    username = request.env[:user]['id'].to_s
    unless (@@connections[username])
      @@connections[username] = []
    end
    stream :keep_open do |out|
      @@connections[username] << out
      out.callback { @@connections[username].delete(out) }
      
      if params['since']
        last = params['since'].to_i
        user = User.find(id: request.env[:user]['id'])

        if user
          updates = user.updates
          updates.select{|u| u.id > last }.map do |u|
            out << "data: #{u.to_hash.to_json}\n\n"
          end
        end
      end
    end
  end
  
  get '/api/v1/updates' do
    resp = []
    username = request.env[:user]['username'].to_sym
    updates = @@updates[username]
    pp updates
    if updates
      if params['since']
        lastSeen = params['since'].to_i
        resp = updates.select {|u| u[:id] > lastSeen}
      else
        resp = updates
      end
    end
    content_type 'text/javascript'
    resp.to_json
  end
  
  post '/api/v1/update' do
    user = User.find(id: request.env[:user]['id'])
    if user
      update = user.add_update(upd: @rawJsonBody)
      
      puts update.to_hash.to_json
      @@connections[user.id.to_s].each do |out|
        out << "data: #{update.to_hash.to_json}\n\n"
      end
      
      content_type 'text/javascript'
      {message: 'Update successful'}.to_json
    else
      halt 401, {message: 'Unknown user'}.to_json
    end      
  end
end
