var manifest = {
    "name": "TweetSup?",
    "app": {
        "urls": [
            "https://tweetsup.mozillalabs.com"
        ],
        "launch": {
            "web_url": "https://tweetsup.mozillalabs.com"
        }
    },
    "icons": {
        "48": "https://tweetsup.mozillalabs.com/icon.png"
    },
    "description": "Perform searches across your twitter friends timelines and receive notifications from inside your application dashboard",
    "developerName": "Mozilla Labs",
    "auth": "https://tweetsup.mozillalabs.com/auth",
    "conduit": "https://tweetsup.mozillalabs.com/conduit/",
    "supportedAPIs": [
        "search",
        "notification"
    ]
};

$(document).ready(function() {
    var sto = window.localStorage;
    for (var i = 0; i < sto.length; i++) {
        var key = sto.key(i);
        $("#output").append($('<div/>').text(key + ": " + sto.getItem(key)));
    }

    var updateButton = function() {
        // make a button for application installation:
        $('#install_prompt').empty().append($('<button>You Gots The App.</button>').button({ disabled: true }));

        AppClient.getInstalled({
            callback: function(v) {
                if (v.installed.length == 0) {
                    $('#install_prompt').empty().append($('<button>Install The App!</button>').button());
                    $('#install_prompt button').click(function() {
                        AppClient.install({
                            manifest: manifest,
                            callback: function(v) {
                                updateButton();
                            }
                        });
                    });
                }
            }
        });
    };
    updateButton();


    function buildTweetNode(t, highlight) {
      function re_escape(t) {
	return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      }

      var tweet = $("<div/>").addClass("tweet");
      var user = (t.user ? t.user : t.sender);
      $(tweet).append($("<div class=\"who\"><img src=\""+ user.profile_image_url +"\"/><div>" + user.screen_name + "</div></div>"));
      var whatTheySpake = t.text;
      if (highlight) {
	whatTheySpake = t.text.replace(new RegExp("(" + re_escape(highlight) + ")", "gi"), "<span class=\"highlight\">$1</span>" );
      }
      $(tweet).append($("<div/>").addClass("what").append($("<div/>").addClass("tweeter").text())
		      .append($("<div/>").addClass("utterance").html(whatTheySpake)));
      return tweet;
    }

    // got auth?
    if (typeof sto.getItem("oauth_token")  === 'string' &&
        typeof sto.getItem("oauth_secret")  === 'string')
    {
      var url = 'query.php?token=' + sto.getItem('oauth_token') + "&secret=" + sto.getItem('oauth_secret')
	+ "&path=statuses/friends_timeline.json&include_rts=true&count=20";
      $.getJSON(url, function(data) {
	for (var i in data) {
	  $('#timeline').append(buildTweetNode(data[i]));
	}
      });

      var search = null;
      // set up our search button
      $('#searchbox').keyup(function(e) {
	$('#searchOutput').empty();
	$('#searchStats').empty();
	var start = new Date();
	var term = $.trim($('#searchbox').val());
	if (search) Search.cancel(search);
	if (term) {
	  search = Search.run(term, function(r) {
	    $('#searchOutput').append(buildTweetNode(r, term));
	  }, function (r) {
	    var secs = ((new Date() - start) / 1000.0).toFixed(2);
	    $('#searchStats').text(r.matches + " matches found.  " + r.total + " searched in " + secs + "s");
	  });
	}
      });
    }
    else
    {
        var foo;
        $("<div>You must <a href='auth'>authenticate</a>, that is, tell twitter that it's ok for us to " +
          " access your tweet stream on your behalf.</div>").dialog({
            modal: true,
            draggable: false,
            title: "Login Required!",
        });
    }


});
