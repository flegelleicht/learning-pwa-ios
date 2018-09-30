require 'sinatra/base'

class Application < Sinatra::Base
  configure do
    set :bind, '0.0.0.0'
    set :port, 5678
    set :server, 'thin'
    set :connections, []
  end
  
  get '/stream', provides: 'text/event-stream' do
    stream :keep_open do |out|
      settings.connections << out
      out.callback { settings.connections.delete(out) }
    end
  end
  
  post '/' do
    settings.connections.each { |out| out << "data: #{params[:msg]}\n\n"}
    204
  end
  
  get '/' do
    "
    <html>
      <head> 
        <title>Super Simple Chat with Sinatra</title> 
        <meta charset='utf-8' />
        <script src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script> 
      </head> 
      <body>
      <pre id='chat'></pre>

      <form>
        <input id='msg' placeholder='type message here...' />
      </form>

      <script>
        // reading
        var es = new EventSource('/stream');
        es.onmessage = function(e) { $('#chat').append(e.data + \"\n\") };

        // writing
        $('form').submit(function(e) {
          $.post('/', {msg: \"User: \" + $('#msg').val()});
          $('#msg').val(''); $('#msg').focus();
          e.preventDefault();
        });
      </script>
      </body>
    </html>
    "
  end
  
  def self.run!
    super
  end

  run! if app_file == $0
end