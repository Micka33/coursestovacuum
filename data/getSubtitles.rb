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

chapters = keys.map do |el|
  el[:keys].map do |key|
    {
      key:    key,
      hash:   el[:session],
      parts:  redis.HGET(el[:session], key)
    }
  end
end

cmds = []
chapters.flatten.each do |chapter|
  parts = Oj.load(chapter[:parts])
  newparts = parts.map do |part|
    unless part['videosub'].nil? || part['videosub'].empty? || part['videosub']['urljson'].include?('undefined')
      response = open(url+part['videosub']['urljson'].gsub(/\s/, ''))
      if part['videosub']['urljson'] == '/c4x/VirchowVillerme/05001/asset/subs_C001AF-W3-E3-FR.srt.sjson'
        response = response.gsub(',"', '",').gsub('"A la semaine prochaine.  Au revoir.', '"A la semaine prochaine.  Au revoir."')
      end
      begin
        response = Oj.load(response)
        text = response['text'].join(' ').gsub(%r{</?[^>]+?>}, '').gsub(/\n/, ' ')
        part['videosub']['text'] = text
        part['videosub']['json'] = response
      rescue
      end
    end
    part
  end
  cmds << {hash:chapter[:hash], key:chapter[:key], content:Oj.dump(newparts)}
end

ret = redis.pipelined do
  cmds.each do |cmd|
    p "HSET '#{cmd[:hash]}' '#{cmd[:key]}' cmd[:content]"
    redis.HSET(cmd[:hash], cmd[:key], cmd[:content])
  end
end

ret.each{|r| p r}
