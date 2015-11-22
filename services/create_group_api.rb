require 'virtus'
require 'httparty'

#get group Result
class GroupResult
  include Virtus.model

  attribute :code
  attribute :id
  attribute :group_name
  attribute :group_id


  def to_json
    to_hash.to_json
  end
end

# call create group api
class CreateGroupFromAPI
  def initialize(api_url, form)
    @api_url = api_url
    params = form.attributes
    @options =  { body: params.to_json,
                  headers: { 'Content-Type' => 'application/json' }
                }
  end

  def call
    results = HTTParty.post(@api_url, @options)
    group_results = GroupResult.new(results)
    group_results.code = results.code
    group_results.id = results.request.last_uri.path.split('/').last
    group_results
  end
end