Rails.application.routes.draw do
  namespace 'red_hat_access' do
    resources :articles, :only => [:index, :edit] do
      collection do
        get :items
      end
    end
  end
end
