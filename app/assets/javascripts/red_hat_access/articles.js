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
(function( $ ) {


$(document).ready(function() {
    // Set up stuff for RHN/Strata queries
    //console.log("on ready");
    var authAjaxParams = $.extend({
        url : 'https://' + portal_hostname +
        '/services/user/status?jsoncallback=?',
        success : function (auth) {
            'use strict';
            if (auth.authorized) {
                $('#logged-in').html("<a href='http://access.redhat.com'>Logged in to the Red Hat Customer Portal as " + auth.name + "</a>");
            } else {
                $('#logged-in').html("<a style='color: #bd362f;' href='https://access.redhat.com'>Not logged in to the Red Hat Customer Portal, please login and refresh this page</a>");
            }
        }
    }, baseAjaxParams);

    // See if we are logged in to RHN or not
    $.ajax(authAjaxParams);

    $(document).on('submit', '#rh-search', function (evt) {
        //console("on subbmit");
        doSearch($('#rhSearchStr').val());
        evt.preventDefault();
    });
});

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
        handleSuggestions(suggestions);
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
})( jQuery );