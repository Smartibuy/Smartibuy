require 'page-object'

class MainPage
  include PageObject
  page_url "http://localhost:9292/"

  link(:group_link, text: '賣場列表')
end
