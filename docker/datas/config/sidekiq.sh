#!/bin/sh
cd /execs/rails/elasticsearh_api
bundle install
bundle exec sidekiq -C config/sidekiq.yml
