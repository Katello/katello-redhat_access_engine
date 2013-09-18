/**
 Copyright 2013 Red Hat, Inc.

 This software is licensed to you under the GNU General Public
 License as published by the Free Software Foundation; either version
 2 of the License (GPLv2) or (at your option) any later version.
 There is NO WARRANTY for this software, express or implied,
 including the implied warranties of MERCHANTABILITY,
 NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
 have received a copy of GPLv2 along with this software; if not, see
 http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.
*/

var portal_hostname = 'access.redhat.com';
var strata_hostname = 'api.' + portal_hostname;
var baseAjaxParams = { 
    accepts : { 
        jsonp : 'application/json,text/json'
    },
    crossDomain : true,
    type : 'GET',
    method : 'GET',
    headers : { 
        Accept : 'application/json,text/json'
    },
    xhrFields : { 
        withCredentials : true
    },
    contentType : 'application/json',
    data : {}, 
    dataType : 'jsonp'
};



KT.panel.list.registerPage('articles', { create : 'new_article' });
KT.panel.set_expand_cb(function() {
    var children = $('#panel .menu_parent');
    $.each(children, function(i, item) {
        KT.menu.hoverMenu(item, { top : '75px' });
    });
});

$(document).ready(function() {
    KT.panel.set_expand_cb(function() {
        KT.article.initialize_edit();
    });
    $(document).on('submit', '#search_form', function (evt) {
        doSearch($('#search').val());
        cancelDefaultAction(evt);
    });
});

KT.article = (function($) {
    var initialize_edit = function() {
        // empty for now
    };

    return {
        initialize_edit: initialize_edit
    };
}(jQuery));

function doSearch(searchStr) {
    getSolutionsFromText(searchStr, searchResults);
}

function getSelectedText() {
    var t = '';
    if(window.getSelection){
      t = window.getSelection();
  }else if(document.getSelection){
      t = document.getSelection();
  }else if(document.selection){
      t = document.selection.createRange().text;
  }
  return t;
}

function getSolutionsFromText(data, handleSuggestions) {
    var getSolutionsFromTextParms = $.extend( {}, baseAjaxParams, {
      url: 'https://' + strata_hostname + '/rs/problems?limit=10',
      data: data,
      type: 'POST',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      success: function(response_body) {
        //Get the array of suggestions
        var suggestions = response_body.source_or_link_or_problem[2].source_or_link;
        //handleSuggestions(suggestions);
        //alert("Got suggestions");
    },
    error: function(response) {
      //Handle error appropriately for your UI
  }
});
    $.ajax(getSolutionsFromTextParms);
}

function fetchSolutions(suggestions) {
    suggestions.forEach(fetchSolution);
}

function searchResults(suggestions) {
    $("#solutions").on("click", function () {
        $(".collapse").collapse('hide');
    });
    suggestions.forEach(fetchSolution);
}

function fetchSolution(element, index, array) {
    var accordion_header = "<div class='accordion-group'>"
                                        + "<div class='accordion-heading'>"
                                        + "<a class='accordion-toggle' data-toggle='collapse' "
                                        + "data-parent='solnaccordion' href='#soln" + index + "'>"
                                        + element.value + "</a></div>";
    var soln_block = "<div id='soln" + index + "' class='accordion-body collapse in'>"
                     + "<div id='soln" + index + "-inner' class='accordion-inner'></div></div></div>"

    if (document.getElementById('solution') !== null) {
        $('#solution').append(soln_block);
    }
    else {
        accordion_header = accordion_header + soln_block;
    }

    var fetchSolutionText = $.extend({}, baseAjaxParams, {
        dataType: 'json',
        contentType: 'application/json',
        url: element.uri,
        type: "GET",
        method: "GET",
        success: function (response) {
            appendSolutionText(response, index);
        }
    });
    $('#solutions').append(accordion_header);
    $(".collapse").collapse('hide');
    $.ajax(fetchSolutionText);
}

function appendSolutionText(response, index) {
    var environment_html = response.environment.html;
    var issue_html = response.issue.html;
    var resolution_html = '';
    if (response.resolution !== undefined) {
        resolution_html = response.resolution.html;
    }
    var solution_html = "<h3>Environment</h3>" + environment_html
                                + "<h3>Issue</h3>" + issue_html
                                + "<h3>Resolution</h3>" + resolution_html;
    $('#soln' + index + '-inner').append(solution_html);
}

function cancelDefaultAction(e) {
 var evt = e ? e:window.event;
 if (evt.preventDefault) evt.preventDefault();
 evt.returnValue = false;
 return false;
}