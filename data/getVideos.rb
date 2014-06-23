# encoding: UTF-8

require 'redis'
require 'yaml'
require 'oj'

require 'net/http'
require 'uri'
def open(url)
  Net::HTTP.get(URI.parse(url))
end


env         = 'development'
redis_conf  = YAML.load_file(__dir__+"/node/redis.yml")[env]
port        = redis_conf['port']  || 6379
host        = redis_conf['host']  || 'localhost'
redis       = Redis.new(:host => host, :port => port)
url         = 'https://www.france-universite-numerique-mooc.fr'

courses = redis.LRANGE('france-universite-numerique-mooc', 0, -1).uniq
sessions = redis.pipelined{courses.each{|course| redis.LRANGE(course, 0, -1)}}.flatten.uniq

keys = sessions.map{|session| {keys:redis.HKEYS(session), session:session}}

chapters = keys.map { |el|
  el[:keys].map do |key|
    {
        key: key,
        hash: el[:session],
        parts: redis.HGET(el[:session], key)
    }
  end
}.flatten

all_videos = []
chapters.each do |chapter|
  parts = Oj.load(chapter[:parts])
  all_videos += parts.map { |part|
    unless part['videos'].empty?
      output_document = "./tmp/#{part['title'].gsub(/\n/, '').squeeze}_mp4_h264_aac_hd.mp4"
      `wget --output-document="#{output_document}" #{part['videos']['HD']}`
      output_document
    end
    nil
  }.compact
end
puts 'Everything went as expected: '+(all_videos.length == all_videos.uniq.length).to_s+'.'

# ret = redis.pipelined do
#   cmds.each do |cmd|
#     p "HSET '#{cmd[:hash]}' '#{cmd[:key]}' cmd[:content]"
#     redis.HSET(cmd[:hash], cmd[:key], cmd[:content])
#   end
# end
#
# ret.each{|r| p r}
