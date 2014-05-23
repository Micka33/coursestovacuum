class HomeController < ApplicationController



  def index
    render json: Course.all
  end

  def search
    render json: {params: search_params, result:Mongoid::Elasticsearch.search(search_params)}
  end



  private

  def search_params
    params.require(:q)
  end

end