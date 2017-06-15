Rails.application.routes.draw do
  resources :responses
  get 'questions/:question_uid/responses' => 'responses#responses_for_question'
  post 'responses/create_or_increment'
  post 'responses/mass_edit/show_many' => 'responses#show_many'
  put 'responses/mass_edit/edit_many' => 'responses#edit_many'
  post 'responses/mass_edit/delete_many' => 'responses#delete_many'
  post 'questions/:question_uid/responses/search' => 'responses#search'


  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
