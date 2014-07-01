raw_yaml = YAML.load(File.read(File.join(Rails.root, '/config/sidekiq.yml')))
SIDEKIQ_CONFIG = raw_yaml.merge(raw_yaml[Rails.env])

# If running in a container and env variables are set
unless  ENV['REDIS_1_PORT_6379_TCP_ADDR'].nil? || ENV['REDIS_1_PORT_6379_TCP_ADDR'].empty? ||
        ENV['REDIS_1_PORT_6379_TCP_PORT'].nil? || ENV['REDIS_1_PORT_6379_TCP_PORT'].empty?
  SIDEKIQ_CONFIG[:url] = "redis://#{ENV['REDIS_1_PORT_6379_TCP_ADDR']}:#{ENV['REDIS_1_PORT_6379_TCP_PORT']}/0"
end



Sidekiq.configure_client do |config|
  config.redis = {
      :url       => SIDEKIQ_CONFIG[:url],
      :namespace => SIDEKIQ_CONFIG[:namespace],
      :size      => SIDEKIQ_CONFIG[:client_connections]
  }
end

Sidekiq.configure_server do |config|
  config.redis = {
      :url       => SIDEKIQ_CONFIG[:url],
      :namespace => SIDEKIQ_CONFIG[:namespace],
      :size      => SIDEKIQ_CONFIG[:client_connections]
  }
end
