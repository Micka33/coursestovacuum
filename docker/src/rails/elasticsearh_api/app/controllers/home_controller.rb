class HomeController < ApplicationController

  def index
    nb_videos = 0
    courses = Course.all
    courses.each { |c| nb_videos += 1 unless c.video_url.nil? || c.video_url.empty? }
    render json: {nb_courses:courses.length, nb_videos:nb_videos, courses:courses}
  end

  def search
    render json: {params: search_params, result:Mongoid::Elasticsearch.search(search_params)}
  end

  def import_json_file
    courses_json = JSON.parse( File.read('datas.json')  )
    ret = Course.create(courses_json)
    render json: {ret: ret, courses:courses_json}
  end

  def nb_jobs
    njobs = 0
    $REDIS_POOL.with do |redis|
      njobs = redis.HGETALL('coursestovacuum_jobs').length
    end
    render json: {jobs_left: njobs}
  end

  def what_is_this_job
    job_id = params[:jid]
    job = nil
    $REDIS_POOL.with do |redis|
      job = JSON.parse(redis.HGET('coursestovacuum_jobs', job_id))
    end
    return render json: {id:job_id, state:job["state"], job: job["bin"]+' '+job["params"].join(' ')} unless job.nil?
    render json: {id:job_id, err: "Not Found"} 
  end

  def ignore_a_job
    job_id = params[:jid]
    job = nil
    $REDIS_POOL.with do |redis|
      job = JSON.parse(redis.HGET('coursestovacuum_jobs', job_id))
      job['state'] = 'ignored'
      redis.HSET('coursestovacuum_jobs', job_id, JSON.dump(job))
    end
    return render json: {id:job_id, state:job['state'], job: job["bin"]+' '+job["params"].join(' ')} unless job.nil?
    render json: {id:job_id, err: "Not Found"} 
  end

  def list_all_ignored_job
    jobs = nil
    $REDIS_POOL.with do |redis|
      jobs = redis.HKEYS('coursestovacuum_jobs').map { |job_id|
        unless job_id.nil?
          job = JSON.parse(redis.HGET('coursestovacuum_jobs', job_id))
          job if job['state'] == 'ignored'
        end
      }.compact
    end
    return render json: {ignored_jobs:jobs} unless jobs.nil? || jobs.empty?
    render json: {ignored_jobs: "No job Found"}
  end

  private

  def search_params
    params.require(:q)
  end

end
