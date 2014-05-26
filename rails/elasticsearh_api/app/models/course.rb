class Course < Doc

  field :part,          type: String
  field :video_url_ori, type: String
  field :video_url,     type: String
  field :chapter,       type: String
  field :session,       type: String
  field :course,        type: String
  field :subtitle,      type: String


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