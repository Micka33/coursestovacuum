class MigrationController < ApplicationController


  def start
    $REDIS_POOL.with do |redis|

      courses = redis.LRANGE('france-universite-numerique-mooc', 0, -1).uniq.reject(&:empty?)
      sessions = redis.pipelined{courses.each{|course| redis.LRANGE(course, 0, -1)}}.flatten.uniq
      keys = sessions.map{|session| {keys:redis.HKEYS(session), session:session}}
      chapters = keys.map { |el|
        el[:keys].map do |key|
          {
              key: key,
              hash: el[:session],
              parts: redis.HGET(el[:session], key),
              course: el[:session].split('[_-_]').first,
              session: el[:session].split('[_-_]').last

          }
        end
      }.flatten
      with_videos_only = []
      chapters.each do |chapter|
        parts = JSON.parse(chapter[:parts])
        parts.map { |part|

          # Trying to get the subtitles
          unless part['videosub'].nil? || part['videosub'].empty? || part['videosub']['urljson'].include?('undefined')
            response = HTTParty.get('https://www.france-universite-numerique-mooc.fr'+part['videosub']['urljson'].gsub(/\s/, ''))
            response = response.body
            if part['videosub']['urljson'] == '/c4x/VirchowVillerme/05001/asset/subs_C001AF-W3-E3-FR.srt.sjson'
              response = response.gsub(',"', '",').gsub('"A la semaine prochaine.  Au revoir.', '"A la semaine prochaine.  Au revoir."')
            end
            begin
              response = JSON.parse(response)
              text = response['text'].join(' ').gsub(%r{</?[^>]+?>}, '').gsub(/\n/, ' ')
              part['videosub']['text'] = text
              part['videosub']['json'] = response
            rescue
            end
          end
          #Formating the data
          unless part['videos'].empty? || part['videos'].nil?
            hash = {
                part:           JSON.generate(part),
                video_url_ori:  part['videos']['HD'],
                chapter:        part['title'],
                session:        chapter[:session],
                course:         chapter[:course]
            }
            hash[:subtitle] = part['videosub']['text'] unless part['videosub'].nil?
            with_videos_only << hash
          end
          nil
        }.compact
      end


      render json: {created:Course.create(with_videos_only)}
    end
  end



















  def download_videos
    nb_worker = 0
    Course.all.each do |course|
      DownloadVideo.perform_async(course._id.to_s)
      nb_worker += 1
    end
    render json: {nb_worker:nb_worker}
  end


end