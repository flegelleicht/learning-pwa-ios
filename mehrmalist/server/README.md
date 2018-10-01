# server

`server.rb` is the server that delivers the frontend and is used to synchronize changes.

# Instructions

## Install dependencies from Gemfile

We usually put all installed gems into their own directory with `--path`. This keeps the rest of the system clean.

	$ bundle install --path vendor/bundle
	
## Run migrations for sqlite database

	$ bundle exec sequel -m db/migrations sqlite://db/database.db
	
## Create a user in the database

	$ bundle exec sequel sqlite://db/database.db
	Your database is stored in DB...
	irb(main):001:0>require_relative './db/models/user'
	=> true
	irb(main):002:0> User.create do |user|
	irb(main):003:1* user.login = "a-user-login"
	irb(main):004:1> user.pass = "a-user-password"
	irb(main):005:1> end
	=> #<User @values={...
	irb(main):006:0> exit

## Start server with environment variables

Since we do not yet support an `.env` file, you will have to set some environment variables to run the sync server successfully.

The local server is started directly:

	MEHRMALIST_JWT_SECRET=secret-string-for-en/decoding-jwt-tokens \
	MEHRMALIST_JWT_ISSUER=name-of-the-jwt-issuer \
	bundle exec ruby local-server.rb	

The production server uses `config.ru` and is started with `rackup`

	MEHRMALIST_JWT_SECRET=secret-string-for-en/decoding-jwt-tokens \
	MEHRMALIST_JWT_ISSUER=name-of-the-jwt-issuer \
	bundle exec rackup -p PORT
