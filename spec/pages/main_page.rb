require 'page-object'

class MainPage
  include PageObject
  page_url "http://localhost:9292/"

  # link(:home_link, text: 'Home')
  # link(:search_link, text: 'Search')
  # link(:group_link, text: 'Groups')
end
