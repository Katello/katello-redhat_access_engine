
all: srpm

gem:
# generate articles.js with correct version string
	@sed -n 's/.*VERSION = "\(.*\)"/\1/p' ./lib/red_hat_access/version.rb | xargs -i sed 's/\~\[VER\]\~/'{}'/' ./app/assets/javascripts/red_hat_access/articles.js.in > ./app/assets/javascripts/red_hat_access/articles.js

	@gem build ./katello-redhat-access-engine.gemspec

spec:
# generate .spec file from .spec.in
	@sed -n 's/.*VERSION = "\(.*\)"/\1/p' ./lib/red_hat_access/version.rb | xargs -i sed 's/\~\[VER\]\~/'{}'/' ./katello-redhat-access-engine.spec.in > ./katello-redhat-access-engine.spec

SRPM: srpm

srpm: gem spec
# generate source rpm file
	@mkdir -p RPM/SOURCES
	@mkdir -p RPM/SPECS
	@cp katello-redhat-access-engine*.gem RPM/SOURCES
	@cp katello-redhat-access-engine.spec RPM/SPECS
	@rpmbuild --define="_topdir `pwd`/RPM" -bs ./RPM/SPECS/katello-redhat-access-engine.spec

clean:
	@rm -f katello-redhat-access-engine*.gem
	@rm -f katello-redhat-access-engine.spec
	@rm -fr ./public
	@rm -f ./app/assets/javascripts/red_hat_access/articles.js
	@rm -rf ./RPM
