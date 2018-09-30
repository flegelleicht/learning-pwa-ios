require 'sinatra/base'

class Server < Sinatra::Base
  configure do
    set :server, 'thin'
    set :port, 61399
    set :logging, true
  end

  get '/' do
    content_type 'text/plain'
    "Hello World!"
  end
end

