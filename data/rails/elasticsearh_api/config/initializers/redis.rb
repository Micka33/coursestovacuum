REDIS_CONFIG = YAML::load(File.open("#{Rails.root}/config/redis.yml"))[Rails.env]
$REDIS_POOL = ConnectionPool.new(:size => 10, :timeout => 3) { Redis.new(:host => REDIS_CONFIG['host'], :port => REDIS_CONFIG['port']) }
