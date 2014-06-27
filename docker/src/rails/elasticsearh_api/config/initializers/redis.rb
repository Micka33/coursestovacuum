REDIS_CONFIG = YAML::load(File.open("#{Rails.root}/config/redis.yml"))[Rails.env]
REDIS_CONFIG['host'] = ENV["REDIS_1_PORT_6379_TCP_ADDR"]
REDIS_CONFIG['port'] = ENV["REDIS_1_PORT_6379_TCP_PORT"]
$REDIS_POOL = ConnectionPool.new(:size => 10, :timeout => 3) { Redis.new(:host => REDIS_CONFIG['host'], :port => REDIS_CONFIG['port']) }
