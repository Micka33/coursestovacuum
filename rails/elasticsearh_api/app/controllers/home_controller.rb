class HomeController < ApplicationController

  def index
    nb_videos = 0
    courses = Course.all
    courses.each { |c| nb_videos += 1 unless c.video_url.nil? || c.video_url.empty? }
    render json: {nb_courses:courses.length, nb_videos:nb_videos, courses:courses}
  end

  def search
    nb_videos = 0
    courses = Mongoid::Elasticsearch.search(search_params)
    courses.each { |c| nb_videos += 1 unless c.video_url.nil? || c.video_url.empty? }
    render json: {nb_courses:courses.length, nb_videos:nb_videos, courses:courses}
  end

  def import_json_file
    courses_json = JSON.parse( File.read('datas.json')  )
    ret = Course.create(courses_json)
    render json: {ret: ret, courses:courses_json}
  end

  private

  def search_params
    params.require(:q)
  end

end
