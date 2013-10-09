#
# Copyright 2013 Red Hat, Inc.
#
# This software is licensed to you under the GNU General Public
# License as published by the Free Software Foundation; either version
# 2 of the License (GPLv2) or (at your option) any later version.
# There is NO WARRANTY for this software, express or implied,
# including the implied warranties of MERCHANTABILITY,
# NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
# have received a copy of GPLv2 along with this software; if not, see
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.

module RedHatAccess
  class Engine < ::Rails::Engine


    initializer :finisher_hook do |engine|
      resources = Dir[File.dirname(__FILE__) + '/navigation/*.rb']
      resources.uniq.each { |f| require f }

      ::Navigation::Additions.insert_after(:organizations, RedHatAccess::Navigation::Articles)
    end

    initializer :register_assets do |engine|

      if Rails.env.production?
        assets = YAML.load_file("#{RedHatAccess::Engine.root}/public/assets/manifest.yml")

        assets.each_pair do |file, digest|
          engine.config.assets.digests[file] = digest
        end
      end

      engine.middleware.use ::ActionDispatch::Static, "#{RedHatAccess::Engine.root}/public"
    end
  end
end
