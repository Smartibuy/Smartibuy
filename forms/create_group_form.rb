require 'virtus'
require 'active_model'

class StringStripped < Virtus::Attribute
  def coerce(value)
    value.is_a?(String) ? value.strip : nil
  end
end

# Form object
class CreateGroupForm
  include Virtus.model
  include ActiveModel::Validations

  attribute :group_id, StringStripped
  attribute :group_name, StringStripped
 

  validates :group_id, presence: true
  validates :group_name, presence: true


  def error_fields
    errors.messages.keys.map(&:to_s).join(', ')
  end
end