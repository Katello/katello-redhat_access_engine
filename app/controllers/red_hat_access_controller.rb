class RedHatAccessController < ::ApplicationController
  def rules
    {
      :index => lambda{true}
    }
  end

  def index
  end
end
