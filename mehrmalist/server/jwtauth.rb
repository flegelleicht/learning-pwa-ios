class JwtAuth
  def initialize app
    @app = app
  end

  def decodeBearerInEnv(bearer, env)
    options = { algorithm: 'HS256', iss: ENV['MEHRMALIST_JWT_ISSUER'] }
    payload, header = JWT.decode bearer, ENV['MEHRMALIST_JWT_SECRET'], true, options
    env[:scopes] = payload['scopes']
    env[:user] = payload['user']
  end

  def call env
    begin
      if env.fetch('PATH_INFO', '') =~ /(^\/api\/v1)/
        # Only handle api routes
        if env.fetch('PATH_INFO', '') =~ /\/login$/
          # Do nothing when trying to log in
        elsif env.fetch('PATH_INFO', '') =~ /\/updatestream$/
          bearer = CGI.parse(env.fetch('QUERY_STRING', ''))['token'][0]
          decodeBearerInEnv(bearer, env)
        else
          bearer = env.fetch('HTTP_AUTHORIZATION', '').slice(7..-1)
          decodeBearerInEnv(bearer, env)
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