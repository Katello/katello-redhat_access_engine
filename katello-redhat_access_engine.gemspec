$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "red_hat_access/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "katello-redhat_access_engine"
  s.version     = RedHatAccess::VERSION
  s.authors     = ["Katello"]
  s.email       = ["katello-devel@redhat.com"]
  s.homepage    = "https://github.com/Katello/katello-redhat_access_engine"
  s.licenses    = ["GPL-2"]
  s.summary     = "Katello engine to access Red Hat knowledge base"
  s.description = "Katello engine to access Red Hat knowledge base search"

  s.files = Dir["{app,public,config,db,lib,vendor}/**/*"] + ["Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]
end
