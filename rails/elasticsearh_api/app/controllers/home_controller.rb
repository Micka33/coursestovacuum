class HomeController < ApplicationController



  def index
    nb_videos = 0
    Course.all.each { |c|
      unless c.video_url.nil? || c.video_url.empty?
        nb_videos += 1
      end
    }
    render json: {nb_courses:Course.all.length, nb_videos:nb_videos, courses:Course.all}
  end

  def search
    render json: {params: search_params, result:Mongoid::Elasticsearch.search(search_params)}
  end



  private

  def search_params
    params.require(:q)
  end

end