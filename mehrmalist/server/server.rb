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
    @account = {
      "#{ENV['MEHRMALIST_USER']}" => "#{ENV['MEHRMALIST_PASS']}"
    }
    @@updates = {}
    @@connections = {};
  end
  
  before do
    begin
      request.body.rewind
      @req = JSON.parse request.body.read
    rescue JSON::ParserError
      @req = {}
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
      exp: Time.now.to_i + 60 * 60 * 24,
      iat: Time.now.to_i,
      iss: ENV['MEHRMALIST_JWT_ISSUER'],
      scopes: ['get_state', 'add_change'],
      user: {
        username: username
      }
    }
  end

  get '/' do
    send_file 'index.html'
  end
  
  post '/api/v1/login' do
    user = @req['user']
    pass = @req['pass']

    if @account[user] == pass
      content_type :json
      { token: token(user) }.to_json
    else
      halt 401
    end
  end
  
  get '/api/v1/state' do
    content_type 'text/javascript'
    {message: 'Here’s your state'}.to_json
  end
  
  # FROM https://gist.github.com/rkh/1476463
  get '/api/v1/updatestream', provides: 'text/event-stream' do
    username = request.env[:user]['username'].to_sym
    unless (@@connections[username])
      @@connections[username] = []
    end
    stream :keep_open do |out|
      @@connections[username] << out
      out.callback { @@connections[username].delete(out) }
      
      updates = @@updates[username]
      if updates
        if params['since']
          lastSeen = params['since'].to_i
          updates.select {|u| u[:id] > lastSeen}.map do |u|
            out << "data: #{u.to_json}\n\n"
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
    user = request.env[:user]
    pp user
    username = user['username'].to_sym
    unless (@@updates[username])
      @@updates[username] = []
    end
    update = {
      id: @@updates[username].length + 1,
      at: Time.now.to_i,
      upd: @req
    }
    @@updates[username] << update
    pp update
    @@connections[username].each {|out| 
      # https://www.html5rocks.com/en/tutorials/eventsource/basics/#toc-event-stream-format
      out << "data: #{update.to_json}\n\n" }
    content_type 'text/javascript'
    {message: 'Update successful'}.to_json
  end
end
