# encoding: UTF-8

require 'redis'
require 'yaml'
require 'json'

require 'net/http'
require 'uri'
def open(url)
  Net::HTTP.get(URI.parse(url))
end


env         = 'development'
redis_conf  = YAML.load_file(__dir__+"/node/redis.yml")[env]
port        = redis_conf['port']  || 6379,
host        = redis_conf['host']  || 'localhost',
redis       = Redis.new(:host => host, :port => port)
url         = 'https://www.france-universite-numerique-mooc.fr'

courses = redis.LRANGE('france-universite-numerique-mooc', 0, -1).uniq
sessions = redis.pipelined{courses.each{|course| redis.LRANGE(course, 0, -1)}}.flatten.uniq

keys = sessions.map{|session| {keys:redis.HKEYS(session), session:session}}

chapters = keys.map do |el|
  el[:keys].map do |key|
    {
      key:    key,
      hash:   el[:session],
      parts:  redis.HGET(el[:session], key)
    }
  end
end

chapters.flatten.each do |chapter|
  puts chapter[:parts]
  parts = JSON.parse(chapter[:parts])
  newparts = parts.map do |part|
    unless part['videosub'].nil? || part['videosub'].empty? || part['videosub']['urljson'].include?('undefined')
      response = JSON.parse(open(url+part['videosub']['urljson']))
      text = response['text'].join(' ').gsub(%r{</?[^>]+?>}, '').gsub(/\n/, ' ')
      part['videosub']['text'] = text
      part['videosub']['json'] = response
    end
    part
  end
  redis.HSET(chapter[:hash], chapter[:key], JSON.generate(newparts))
end
