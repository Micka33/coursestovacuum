class Course
  include Mongoid::Document
  include Mongoid::Elasticsearch

  field :part,          type: String
  field :video_url_ori, type: String
  field :video_url,     type: String
  field :chapter,       type: String
  field :session,       type: String
  field :course,        type: String
  field :subtitle,      type: String

  def as_json(options={})
    attrs = super(options)
    attrs['id'] = attrs['_id'].to_s
    attrs
  end

  elasticsearch!({
    course: {
      properties: {
          part:           {type: 'string', index: :not_analyzed},
          video_url_ori:  {type: 'string', index: :not_analyzed},
          video_url:      {type: 'string', index: :not_analyzed},
          course:         {type: 'string', null_value: 'na', boost: 40},
          session:        {type: 'string', null_value: 'na', boost: 60},
          chapter:        {type: 'string', null_value: 'na', boost: 80},
          subtitle:       {type: 'string', null_value: 'na', boost: 100}
      }
    }
  })

end