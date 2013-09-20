$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "red_hat_access/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "red_hat_access"
  s.version     = RedHatAccess::VERSION
  s.authors     = ["Katello"]
  s.email       = ["katello-devel@redhat.com"]
  s.homepage    = "https://github.com/thomasmckay/katello-engine-welcome"
  s.licenses    = ["GPL-2"]
  s.summary     = "Katello engine to access Red Hat knowledge base"
  s.description = "Katello engine to access Red Hat knowledge BCase Search"

  s.files = Dir["{app,public,config,db,lib}/**/*"] + ["Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 3.2.13"
  # s.add_dependency "jquery-rails"
end
