
/*
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
*/
//= require bootstrap-collapse
var access_client_id = 'redhat-client=read-access-plugin-sam~[VER]~'
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

    checkLogIn();
        $(window).on("focus", checkLogIn); // automatically recheck if the user navigates way from page
        $(document).on('submit', '#rh-search', function (evt) {
        //console("on subbmit");
        doSearch($('#rhSearchStr').val());
        evt.preventDefault();
      });
      });

  function setLoginStatus(loginName, status) {
    if (status){
      $("#rhSearchStr").prop('disabled', false);
      $('#logged-in').html("Logged in to the Red Hat Customer Portal as " + loginName +
       ".&nbsp;&nbsp;<a href='https://www.redhat.com/wapps/sso/logout.html?redirect=https://access.redhat.com/logout' target='_blank'>Log Out </a>" + 
       "&nbsp;&nbsp;<a href='http://access.redhat.com'> Visit Customer Portal</a>");
      
    }else {
     $("#rhSearchStr").prop('disabled', true);
     var ssoPage = 'https://www.redhat.com/wapps/sso/login.html?redirect=https://access.redhat.com/home';
     $('#logged-in').html("<div style='color: #bd362f;'>Not logged in to the Red Hat Customer Portal. <a href=" + ssoPage + " target='_blank'>Please sign in </a ></div>");
     
   }

 }

 function checkLogIn(){
    // Set up stuff for RHN/Strata queries
    //console.log("on ready");
    
    var authAjaxParams = $.extend({
      url : 'https://' + portal_hostname +
      '/services/user/status?jsoncallback=?',
      success : function (auth) {
        'use strict';
        if (auth.authorized) {
          setLoginStatus(auth.name, true);
        } else {
         setLoginStatus(null, false);    
       }
     }
   }, baseAjaxParams);
    
    // See if we are logged in to RHN or not
    $.ajax(authAjaxParams);

  }



  function doSearch(searchStr) {
    //checkLogIn();
    var authAjaxParams = $.extend({
      url : 'https://' + portal_hostname +
      '/services/user/status?jsoncallback=?',
      success : function (auth) {
        'use strict';
        if (auth.authorized) {
          getSolutionsFromText(searchStr, searchResults);
          setLoginStatus(auth.name, true);
        } else {
          alert("You must log in before searching");
          setLoginStatus(null, false);
        }
      }
    }, baseAjaxParams);
    $.ajax(authAjaxParams);
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
      url: 'https://' + strata_hostname + '/rs/problems?'+access_client_id+'&limit=10',
      data: data,
      type: 'POST',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      success: function(response_body) {
        //Get the array of suggestions
        $('#solutions').html(''); //clear exiting results first
        $('#solution').html(''); //clear exiting text first
        var suggestions = response_body.source_or_link_or_problem[2].source_or_link;
        handleSuggestions(suggestions);
      },
      error: function(response) {
      //Handle error appropriately for your UI
      $('#solutions').html("Unable to retrieve solutions.");
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
    $(".accordion-toggle").click(function(){
      $(".accordion-heading").attr("style", "");
      $(".accordion-heading").removeClass("active");
      $(this).parent().addClass("block active");
    });
  }

  function fetchSolution(element, index, array) {
    var accordion_header = "<div class='accordion-group'>"
    + "<div class='accordion-heading block'>"
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
      url: element.uri + '?'+ access_client_id,
      type: "GET",
      method: "GET",
      success: function (response) {
            //console.log(response);
            appendSolutionText(response, index);
          },
          error: function (response) {   
            //console.log(response);
            $('#soln' + index + '-inner').append('We were unable to retrieve details for this solution.');
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


