require 'modules/response_search'

class ResponsesController < ApplicationController
  include ResponseSearch
  before_action :set_response, only: [:show, :update, :destroy]

  # GET /responses
  def index
    @responses = Response.all

    render json: @responses
  end

  # GET /responses/1
  def show
    render json: @response
  end

  # POST /responses
  def create
    @response = Response.new(response_params)

    if @response.save
      render json: @response, status: :created, location: @response
    else
      render json: @response.errors, status: :unprocessable_entity
    end
  end

  # POST /responses/create_or_increment
  def create_or_increment
    @response = Response.find_by_text_and_question_uid(response_params[:text], response_params[:question_uid])
    if !@response
      @response = Response.new(response_params)
      if @response.save
        render json: @response, status: :created, location: @response
      end
    else
      increment_counts
    end
  end

  # PATCH/PUT /responses/1
  def update
    new_vals = response_params
    if new_vals[:concept_results]
      new_vals[:concept_results] = concept_results_to_boolean(new_vals[:concept_results])
    end
    if @response.update(new_vals)
      render json: @response
    else
      render json: @response.errors, status: :unprocessable_entity
    end
  end

  # DELETE /responses/1
  def destroy
    @response.destroy
  end

  # GET /questions/:question_uid/responses
  def responses_for_question
    @responses = Response.where(question_uid: params[:question_uid]).where.not(optimal: nil)
    render json: @responses
  end


  def increment_counts
    @response.increment!(:count)
    increment_first_attempt_count
    increment_child_count_of_parent
  end

  def search
    render json: search_responses(params[:question_uid], search_params)
  end

  def mass_edit
    render json: {responses: Response.where(id: params[:responses])}
  end

  def mass_edit_feedback
    Response.where(id: params[:ids]).update_all(feedback: params[:feedback])
  end

  def mass_edit_concept_results
    Response.where(id: params[:ids]).update_all(concept_results: params[:conceptResults])
  end

  def mass_edit_delete
    Response.where(id: params[:ids]).delete_all
  end

  def batch_responses_for_lesson
    question_uids = params[:question_uids]
    questions_with_responses = Response.where(question_uid: question_uids).group_by(&:question_uid)
    render json: {questionsWithResponses: questions_with_responses}.to_json
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_response
      @response = find_by_id_or_uid(params[:id])
    end

    def search_params
      params.require(:search).permit(
        :pageNumber,
        :text,
        filters: {},
        sort: {}

      )
    end

    # Only allow a trusted parameter "white list" through.
    def response_params
      params.require(:response).permit(
        :id,
        :uid,
        :parent_id,
        :parent_uid,
        :question_uid,
        :author,
        :text,
        :feedback,
        :count,
        :first_attempt_count,
        :child_count,
        :optimal,
        :weak,
        :created_at,
        :updated_at,
        :search,
        concept_results: {}
      )
    end

    def find_by_id_or_uid(string)
      Integer(string || '')
      Response.find(string)
    rescue ArgumentError
      Response.find_by_uid(string)
    end

    def increment_first_attempt_count
      params[:response][:is_first_attempt] == "true" ? @response.increment!(:first_attempt_count) : nil
    end

    def concept_results_to_boolean(concept_results)
      concept_results.each do |key, val|
        concept_results[key] = val == 'true'
      end
    end

    def increment_child_count_of_parent
      parent_id = @response.parent_id
      parent_uid = @response.parent_uid
      id = parent_id || parent_uid
      # id will be the first extant value or false. somehow 0 is being
      # used as when it shouldn't (possible JS remnant) so we verify that
      # id is truthy and not 0
      if id && id != 0
        parent = find_by_id_or_uid(id)
        parent.increment!(:child_count)
      end
    end
end
