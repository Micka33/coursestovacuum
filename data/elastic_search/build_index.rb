# encoding: UTF-8
require 'elasticsearch'
require 'redis'
require 'yaml'
require 'oj'

env         = 'development'
redis_conf  = YAML.load_file(__dir__+'/../node/redis.yml')[env]
port        = redis_conf['port']  || 6379
host        = redis_conf['host']  || 'localhost'
redis       = Redis.new(:host => host, :port => port)

courses   = redis.lrange('france-universite-numerique-mooc', 0, -1).uniq
sessions  = redis.pipelined{courses.each{|course| redis.lrange(course, 0, -1)}}.flatten.uniq
keys      = sessions.map{|session| {keys:redis.hkeys(session), session:session}}
chapters  = keys.map do |el|
  el[:keys].map { |key|
    begin
      {
        key:    key,
        hash:   el[:session],
        parts:  Oj.load(redis.hget(el[:session], key))
      }
    rescue
      nil
    end
  }.compact
end

hash = {courses:{}}
chapters.each do |el|
  el.each do |row|
    course = row[:hash].split('[_-_]').first.squeeze
    sequence = row[:hash].split('[_-_]').last.squeeze
    chapter = row[:key].squeeze
    parts = row[:parts]
    hash[:courses][course] = {} if hash[:courses][course].nil?
    hash[:courses][course][:sequences] = {} if hash[:courses][course][:sequences].nil?
    hash[:courses][course][:sequences][sequence] = {} if hash[:courses][course][:sequences][sequence].nil?
    hash[:courses][course][:sequences][sequence][:chapters] = {} if hash[:courses][course][:sequences][sequence][:chapters].nil?
    hash[:courses][course][:sequences][sequence][:chapters][chapter] = parts
  end
end

# some statistics just to see
hash[:courses].each do |coursename, sequences|

  "[#{coursename.squeeze}] has #{sequences[:sequences].length} sequences."

  sequences[:sequences].each do |sequencename, chaps|

    "      [#{sequencename.squeeze}] has #{chaps[:chapters].length} chapters."

    chaps[:chapters].each do |chaptername, parts|

      "          [#{chaptername.squeeze}] has #{parts.length} parts."

    end
  end
end


def index_video urlhd, urlmedium, urllow, sub, tags
  {
      type: 'video',
      body: {
          url: {
              hd: urlhd,
              medium: urlmedium,
              low: urllow
          },
          sub: sub,
          tags: tags
      }
  }
end

(client = Elasticsearch::Client.new(log: false)).transport.reload_connections!
unless client.cluster.health['status'] != 'green'

  # client.index(:courses).delete if client.index(:courses).exists?

  #client.index(:courses).bulk_index [].tap { |rows|
  [].tap { |rows|
    hash[:courses].each do |coursename, sequences|

      #Construct the tags
      tags = [coursename]
      sequences[:sequences].each do |sequencename, chaps|
        tags << sequencename
        chaps[:chapters].each do |chaptername, _| tags << chaptername end
      end

      #Add Course
      # rows << {
      #     type: 'course',
      #     body: {
      #         title: coursename,
      #         sequences: sequences,
      #         tags: tags,
      #     }
      # }

      sequences[:sequences].each do |sequencename, chaps|
        #Add sequence
        # rows << {
        #     type: 'sequence',
        #     body: {
        #         title: sequencename,
        #         chapters: chaps,
        #         tags: tags,
        #     }
        # }
        chaps[:chapters].each do |chaptername, parts|
          #Add chapter
          # rows << {
          #     type: 'chapter',
          #     body: {
          #         title: chaptername,
          #         parts: parts,
          #         tags: tags,
          #     }
          # }
          parts.each do |part|
            unless part['videos'].empty?
              rows << index_video(part['videos']['HD'], part['videos']['standard'], part['videos']['smartphone'], part['videosub']['text'], tags)
            end
          end
        end
      end



    end
  }




end


