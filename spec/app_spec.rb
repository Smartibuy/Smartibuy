require_relative 'spec_helper'

describe 'Smartibuy Stories' do
  include PageObject::PageFactory
  before do
     unless @browser
       @headless= Headless.new
       @headless.start
       @browser = Watir::Browser.new
     end
   end

  describe 'visit homepage' do
    it 'should find the links' do
      visit MainPage do |page|
        page.title.must_equal 'Smartibuy!'
        # page.home_link_element.exists?.must_equal true
        # page.group_link_element.exists?.must_equal true
        # page.search_link_element.exists?.must_equal true
      end
    end
  end

  ##TODO: group_page
  ##TODO: search_page


  after do
    @browser.close
  end
end
