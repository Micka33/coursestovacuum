class Doc
  include Mongoid::Document
  include Mongoid::Elasticsearch

  def as_json(options={})
    attrs = super(options)
    attrs['id'] = attrs['_id'].to_s
    attrs
  end

end