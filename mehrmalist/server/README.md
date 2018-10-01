# server

`server.rb` is the server that delivers the frontend and is used to synchronize changes.

# Instructions

## Install dependencies from Gemfile

We usually put all installed gems into their own directory with `--path`. This keeps the rest of the system clean.

	bundle install --path vendor/bundle
	
## Start server with environment variables

Since we do not yet support an `.env` file, you will have to set some environment variables to run the sync server successfully.

The local server is started directly:

	MEHRMALIST_USER=login-of-the-one-and-only-user-currently \
	MEHRMALIST_PASS=password-of-the-one-and-only-user-currently \
	MEHRMALIST_JWT_SECRET=secret-string-for-en/decoding-jwt-tokens \
	MEHRMALIST_JWT_ISSUER=name-of-the-jwt-issuer \
	bundle exec ruby local-server.rb	

The production server uses `config.ru` and is started with `rackup`

	MEHRMALIST_USER=login-of-the-one-and-only-user-currently \
	MEHRMALIST_PASS=password-of-the-one-and-only-user-currently \
	MEHRMALIST_JWT_SECRET=secret-string-for-en/decoding-jwt-tokens \
	MEHRMALIST_JWT_ISSUER=name-of-the-jwt-issuer \
	bundle exec rackup -p PORT
