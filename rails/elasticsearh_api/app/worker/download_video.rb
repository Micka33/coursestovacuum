class DownloadVideo
  include Sidekiq::Worker

  def perform(course_id)
    course = Course.find(course_id)

    path = './tmp/videos'
    output_document = "#{course_id}_mp4_h264_aac_hd.mp4"

    if course.video_url.nil? || course.video_url.empty?
      `wget --output-document="#{path+'/'+output_document}" #{course.video_url_ori}`
      Course.find(course_id).update_attributes(video_url: output_document)
    end


  end

end
