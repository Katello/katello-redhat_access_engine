class ArticlesController < ::ApplicationController

  before_filter :panel_options, :only => [:index, :items]
  before_filter :find_article, :only => [:edit]

  def rules
    {
        :index => lambda{true},
        :items => lambda{true},
        :edit => lambda{true}
    }
  end

  def items
    @articles = ArticleResource.search("satellite")

    render_panel_items(@articles, @panel_options, nil, "0")
  end

  def edit
    render :partial => 'articles/edit', :locals => {:article => @article}
  end

  protected

  def find_article
    @article = ArticleResource.get(params[:id])
  end

  def panel_options
    @panel_options = {
      :title => _('Red Hat Articles'),
      :col => ['value'],
      :titles => [_('Title')],
      :name => controller_display_name,
      :list_partial => 'articles/list_articles',
      :ajax_load  => true,
      :ajax_scroll => items_red_hat_access_articles_path(),
      :enable_create => false,
      :initial_action => :edit
    }
  end

  private

  def controller_display_name
    return 'articles'
  end

  class ArticleResource

    def self.config
      {
        :api_path   => '',
        :url        => Katello.config.redhat.url,
        :user       => Katello.config.redhat.username,
        :http_auth  => {:password => Katello.config.redhat.password },
        :headers    => {:content_type => 'application/json',
                        :accept       => 'application/json'},
        :logging    => {}
      }
    end

    def self.search(search_terms, limit=10)
      url = "/rs/problems?limit=#{limit}"
      resource = RestClientResource.new(config)
      response = resource.call(:post, url, {:payload => {:required => search_terms}})
      response['source_or_link_or_problem'][2]['source_or_link']
    end

    def self.get(id)
      url = "/rs/solutions/#{id}"
      resource = RestClientResource.new(config)
      response = resource.call(:get, url)
      response
    end
  end


  class RestClientResource

    def initialize(config={})
      @config = config
    end

    def config
      @config
    end

    def path(*args)
      self.class.path(*args)
    end

    def call(method, path, options={})
      clone_config = self.config.clone
      #on occation path will already have prefix
      path = clone_config[:api_path] + path if !path.start_with?(clone_config[:api_path])

      RestClient.log    = []
      logger            = clone_config[:logging][:logger]
      debug_logging     = clone_config[:logging][:debug]
      exception_logging = clone_config[:logging][:exception]

      headers = clone_config[:headers].clone

      get_params = options[:params] if options[:params]
      path = combine_get_params(path, get_params) if get_params

      client_options = {}
      client_options[:timeout] =  clone_config[:timeout] if clone_config[:timeout]
      client_options[:open_timeout] =  clone_config[:open_timeout] if clone_config[:open_timeout]

      if clone_config[:oauth]
        headers = add_oauth_header(method, path, headers) if clone_config[:oauth]
        headers[clone_config[:oauth_user]] = clone_config[:user]
        client = RestClient::Resource.new(clone_config[:url], client_options)
      else
        client_options[:user] =  clone_config[:user]
        client_options[:password] = config[:http_auth][:password]
        client = RestClient::Resource.new(clone_config[:url], client_options)
      end

      args = [method]
      args << generate_payload(options) if [:post, :put].include?(method)
      args << headers

      response = get_response(client, path, *args)
      process_response(response)

    rescue => e
      log_exception
      raise e
    end

    def get_response(client, path, *args)
      client[path].send(*args) do |response, request, result, &block|
        resp = response.return!(request, result)
        log_debug
        return resp
      end
    end

    def combine_get_params(path, params)
      query_string  = params.collect do |k, v|
        if v.is_a? Array
          v.collect{|y| "#{k.to_s}=#{y.to_s}" }.join('&')
        else
          "#{k.to_s}=#{v.to_s}"
        end
      end.flatten().join('&')
      path + "?#{query_string}"
    end

    def generate_payload(options)
      if options[:payload]
        if options[:payload][:optional]
          if options[:payload][:required]
            payload = options[:payload][:required].merge(options[:payload][:optional])
          else
            payload = options[:payload][:optional]
          end
        elsif options[:payload][:delta]
          payload = options[:payload]
        else
          payload = options[:payload][:required]
        end
      else
        payload = {}
      end

      return payload.to_json
    end

    def process_response(response)
      begin
        body = JSON.parse(response.body)
        if body.respond_to? :with_indifferent_access
          body = body.with_indifferent_access
        elsif body.is_a? Array
          body = body.collect  do |i|
            i.respond_to?(:with_indifferent_access) ? i.with_indifferent_access : i
          end
        end
        response = RestClient::Response.create(body, response.net_http_res, response.args)
      rescue JSON::ParserError
      end

      return response
    end

    def required_params(local_names, binding, keys_to_remove=[])
      local_names = local_names.reduce({}) do |acc, v|
        value = binding.eval(v.to_s) unless v == :_
        acc[v] = value unless value.nil?
        acc
      end

      #The double delete is to support 1.8.7 and 1.9.3
      local_names.delete(:payload)
      local_names.delete(:optional)
      local_names.delete("payload")
      local_names.delete("optional")
      keys_to_remove.each do |key|
        local_names.delete(key)
        local_names.delete(key.to_sym)
      end

      return local_names
    end

    def add_http_auth_header
      return {:user => config[:user], :password => config[:http_auth][:password]}
    end

    def add_oauth_header(method, path, headers)
      default_options = { :site               => config[:url],
                          :http_method        => method,
                          :request_token_path => "",
                          :authorize_path     => "",
                          :access_token_path  => "" }

      default_options[:ca_file] = config[:ca_cert_file] unless config[:ca_cert_file].nil?
      consumer = OAuth::Consumer.new(config[:oauth][:oauth_key], config[:oauth][:oauth_secret], default_options)

      method_to_http_request = { :get    => Net::HTTP::Get,
                                 :post   => Net::HTTP::Post,
                                 :put    => Net::HTTP::Put,
                                 :delete => Net::HTTP::Delete }

      http_request = method_to_http_request[method].new(path)
      consumer.sign!(http_request)

      headers['Authorization'] = http_request['Authorization']
      return headers
    end

    def log_debug
      if self.config[:logging][:debug]
        log_message = generate_log_message
        self.config[:logging][:logger].debug(log_message)
      end
    end

    def log_exception
      if self.config[:logging][:exception]
        log_message = generate_log_message
        self.config[:logging][:logger].error(log_message)
      end
    end

    def generate_log_message
      RestClient.log.join('\n')
    end

    def logger
      self.config[:logging][:logger]
    end

  end

  class ConfigurationUndefinedError < StandardError

    def self.message
      # override me to change the error message
      "Configuration not set."
    end
  end
end
