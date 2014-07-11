class CreateVideoThumbnail
  include Sidekiq::Worker

  def perform(course_id)
    course = Course.find(course_id)

    path = './tmp/videos_thumbnails'
    output_document = "#{course_id}.jpeg"

    if  (course.video_thumbnail_url.nil? || course.video_thumbnail_url.empty?) &&
        (!course.video_url.nil? && !course.video_url.empty?)
      puts "(#{course.video_thumbnail_url.to_s}.nil? || #{course.video_thumbnail_url.to_s}.empty?) && (!#{course.video_url.to_s}.nil? && !#{course.video_url.to_s}.empty?)"
      puts "avprobe -loglevel error -show_streams \"#{"./tmp/videos/"+course.video_url}\" | grep duration | cut -f 2 -d = | cut -f 1 -d . | head -1"
      video_duration = `avprobe -loglevel error -show_streams "#{"./tmp/videos/"+course.video_url}" | grep duration | cut -f 2 -d = | cut -f 1 -d . | head -1`.strip
      puts "avconv -y -ss #{(video_duration.to_i / 2).round} -i \"#{"./tmp/videos/"+course.video_url}\" -vframes 1 -f image2 \"#{path+'/'+output_document}\" 2>&1"
      if (system(`avconv -y -ss #{(video_duration.to_i / 2).round} -i "#{"./tmp/videos/"+course.video_url}" -vframes 1 -f image2 "#{path+'/'+output_document}" 2>&1`) == true)
        Course.find(course_id).update_attributes(video_thumbnail_url: output_document)
      else
        puts "rm #{path+'/'+output_document}"
        `rm #{path+'/'+output_document}`
      end
    end
    puts "DONE"
  end

end
