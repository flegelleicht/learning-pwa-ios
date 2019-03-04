FROM ruby:2.6 as gems
WORKDIR /app
COPY Gemfile /app/Gemfile
RUN bundle install --path vendor/bundle

FROM gems as final
COPY --from=gems /app/vendor/bundle /app/vendor/bundle
COPY --from=gems /app/Gemfile* /app/
COPY db /app/db
COPY public /app/public
COPY config.ru jwtauth.rb server.rb /app/
RUN bundle exec sequel -m db/migrations sqlite://db/database.db

WORKDIR /app
EXPOSE 4567
CMD ["bundle", "exec", "rackup", "-p", "4567", "-o", "0.0.0.0"]
