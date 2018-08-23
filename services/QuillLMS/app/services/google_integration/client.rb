require 'google/api_client'

class GoogleIntegration::Client

  def initialize(user, api_client = nil, token_refresher = nil)
    @user            = user
    @api_client      = api_client || Google::APIClient
    @token_refresher = token_refresher || GoogleIntegration::RefreshAccessToken
  end

  def create
    client.authorization.access_token = access_token
    client
  end

  private

  def access_token
    verified_credentials.access_token
  end

  def verified_credentials
    @verified_credentials ||= @token_refresher.new(@user).refresh
  end

  def client
    @client ||= @api_client.new(application_name: 'quill', user_agent: user_agent)
  end

  # Builds a custom user agent to prevent Google::APIClient to
  # use an invalid auto-generated one
  # @see https://github.com/google/google-api-ruby-client/blob/15853007bf1fc8ad000bb35dafdd3ca6bfa8ae26/lib/google/api_client.rb#L112
  def user_agent
    [
      "quill/0.0.0",
      "google-api-ruby-client/#{Google::APIClient::VERSION::STRING}",
      Google::APIClient::ENV::OS_VERSION,
      '(gzip)'
    ].join(' ').delete("\n")
  end
end