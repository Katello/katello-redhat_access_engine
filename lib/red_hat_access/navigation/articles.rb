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
  module Navigation

    class Articles < ::Navigation::Item

      def initialize()
        @key           = :articles
        @display       = _("Red Hat Articles")
        @authorization = lambda{true}
        @url           = red_hat_access_articles_path
      end

    end

    def articles_navigation
      [
        { :key => :article_details,
          :name =>_("Details"),
          :url => lambda{edit_red_hat_access_articles_path(@article[:id])},
          :if => lambda{@article},
          :options => {:class=>"panel_link"},
          :items => systems_subnav
        }
      ]
    end
  end
end
