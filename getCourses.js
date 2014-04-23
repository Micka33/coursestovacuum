// Whole-script strict mode syntax
"use strict";

var email = 'ericgay@yopmail.com';
var pwd = 'Ericgay94';
var sParProfile = 60;
var maxDelayPerRequest = 30;

var webpage = require('webpage'),
    page    = webpage.create(),
    system  = require('system'),
    args    = require('minimist')(system.args.slice(1)),
    moment  = require('moment');
    //clearing minimist memory from the pwd and email
    require('minimist')(['stuff', 'nuff', 'nop', 'top', 'nutch', 'fetch', 'ornot']);








//
// UTILITY
//
var total = 0;
var subtotal = 0;
var current = 0;
var urlLoaded = null;
var log = function(msg)
{
  var time = moment().format('h:mm:ss a');
  console.log('['+time+'] '+msg);
};
var click = function(selector, fakeMode)
{
  if (fakeMode === true)
  {
    page.evaluate(function(selector) {
      return $(selector).trigger('click');
    }, selector);
  }
  else
  {
    var position = page.evaluate(function(selector) {
      return $(selector).offset();
    }, selector);
    page.sendEvent("click", position.left, position.top, 'left');
  }
};
var fillAndsubmit = function(form, names) {
  page.evaluate(function(form, names)
  {
    for (var i = names.length - 1; i >= 0; i--)
    {
      selector = form+' [name='+names[i][0]+']';
      if ($(selector).is('select'))
        $(selector+" option").filter(function() {
          return $.trim($(this).text()) === $.trim(names[i][1]);
        }).prop('selected', true);
      else if ($(selector).is('input'))
        $(selector).val(names[i][1]);
    };
    $(form).submit();
  }, form, names);
};
var printScreen = function(screenpage, name)
{
  screenpage.render(name+'.jpeg', {format: 'jpeg', quality: '100'});
};
var currentUrl = function() {
  return page.evaluate(function(){return window.location.href;});
};
var waittil = function(urlToWaitFor, delay, then) {
  urlLoaded = null;
  var start = moment();
  var urls = ( (Array.isArray(urlToWaitFor)) ? (urlToWaitFor) : ([urlToWaitFor]) );
  var intervalID = window.setInterval(function()
  {
    if ((moment().diff(start, 'seconds') > delay) ||
      (urls.indexOf(urlLoaded) > -1)/* ||
      (urls.indexOf(currentUrl()) > -1)*/)
    {
      clearInterval(intervalID);
      var found = ((urls.indexOf(urlLoaded) > -1)/* || ((urls.indexOf(currentUrl())) > -1) */);
      urlLoaded = null;
      then(found);
    }
  },
  200);
};
page.onLoadFinished = function(status) {
  urlLoaded = currentUrl();
  // page.includeJs('http://localhost:8889/socket.io/socket.io.js');
};
var hasClass = function(el, classToCheck) {
  return page.evaluate(function(el, classToCheck) {
    return $(el).hasClass(classToCheck);
  }, el, classToCheck);
};
var hasDiv = function(selector) {
  var res = page.evaluate(function(selector) {
    return $(selector).length >= 1;
  }, selector);
  return res;
};
var exit = function() {
  log('Fin.');
  phantom.exit();
};

// page.onUrlChanged = function(targetUrl) {
//   console.log('New URL: ' + targetUrl);
// };
// page.onNavigationRequested = function(url, type, willNavigate, main) {
//   console.log('Trying to navigate to: ' + url);
//   console.log('Caused by: ' + type);
//   console.log('Will actually navigate: ' + willNavigate);
//   console.log('Sent from the page\'s main frame: ' + main);
// };
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};
//
//
//
var getCoursesLinks = function()
{
  return page.evaluate(function() {
    var links = [];
    $("ul.courses-listing li").each(function(index, element) {
      var date = $(element).find('.start-date').text();
      if (Date.parse(date) < (new Date))
        links.push($(element).find('section.info a').attr('href'));
    });
    return links;
  });
};
var getGuyInfo = function()
{
  return JSON.stringify({
    name: $('#profile-infos .title').text(),
    age: $('#profile-infos .age').text(),
    city: $('#profile-infos .city').text()
  });
};
var getPaging = function()
{
  return page.evaluate(function() {
    return {  nbResults: $('#charms strong:first').text(),
              totalResults: $('#charms strong.pager-total:first').text()
            };
  });
};














// if (((args.password == undefined) && (args.p == undefined)) ||
//     ((args.email == undefined) && (args.e == undefined)))
// {
//   console.log('Usage: crawl.js --password secret --email you@email.com');
//   console.log('       crawl.js -p secret -e you@email.com');
//   exit();
// }
// email = btoa((args.email != undefined)?(args.email):(args.e));
// pwd = btoa((args.password != undefined)?(args.password):(args.p));

//Clearing args parameter from memory and freezing it, since we won't use it anymore.
args.email = 'nothingtoseeherejustclearing1thistobesurenoonereaditinmemory';
args.e = 'nothingtoseeherejustclearingthis2tobesurenoonereaditinmemory';
args.password = 'nothingtoseeherejustclear3ingthistobesurenoonereaditinmemory';
args.p = 'nothingtoseeherejustclearingthis4tobesurenoonereaditinmemory';
Object.freeze(args);

















//DATABASE UTILITIES
var saveProfile = function(profile) {
  page.evaluate(function(email, profile) {
    // $(document).append('<script src="http://localhost:8889/socket.io/socket.io.js"></script>');
    var fireWhenReady = function () {
        if (typeof io != 'undefined') {
          var socket = io.connect('http://localhost:8889/');
          // socket.on('connect', function () {
            socket.emit('register', { email:email, profile:profile });
          // });
        }
        else {
          setTimeout(fireWhenReady, 100);
        }
    };
    fireWhenReady();
  }, email, profile);
};










//
// Algo
//
// var visitProfiles = function()
// {
//   var paging = getPaging();
//   log('Affichage des profiles '+paging.nbResults+' sur '+paging.totalResults+'.');
//   var profiles = getPageResult();
//   log('length:'+profiles.length.toString());
//   log('profiles:'+profiles);

//   for (var i = profiles.length - 1; i >= 0; i--) {
//     saveProfile(profiles[i]);
//   };

//   if (hasClass('#charms .nav-pager a.pager-next span.pager-right', 'off'))
//   {
//     log('Tous les resultats ont été récupéré.');
//     exit();
//   }

//   var curl = currentUrl();
//   var nurl = curl.split('=')[0]+'='+(parseInt(curl.split('=')[1]) + 1);
//   click('#charms .nav-pager a.pager-next', true);
//   waittil(nurl, maxDelayPerRequest, function(loaded)
//   {
//     if (loaded || (currentUrl() === nurl))
//     {
//       visitProfiles();
//     }
//     else
//     {
//       log("Impossible de charger la page suivante des profiles. :'(");
//       exit();
//     }
//   });
// }
var getLinks = function()
{
  log('Récupération de la liste des cours.');
  // If there is no results displayed
  var coursesLinks = getCoursesLinks();
  log(coursesLinks.length);
  for (var i = coursesLinks.length - 1; i >= 0; i--)
  {
    console.log("phantomjs ./getCourseLinks.js --course "+coursesLinks[i]);
  };
  exit();
}
var goToCourses = function()
{
  log('Affichage des cours.');
  click('body > header > nav > ol.left.nav-global.authenticated > li > ul > li:nth-child(3) > a');
  waittil('https://www.france-universite-numerique-mooc.fr/courses', maxDelayPerRequest, function(loaded)
  {
    if (loaded)
      getLinks();
    else
    {
      log('Impossible de charger la page de recherche. :\'(');
      exit();
    }
  });
}
var signIn = function()
{
  log('Connexion en tant que '+email+'.');
  fillAndsubmit('form#login-form',
    [['email', email],
     ['password', pwd]
    ]
  );
  waittil('https://www.france-universite-numerique-mooc.fr/dashboard', maxDelayPerRequest, function()
  {
    log('Connexion réussie ! :D');
    goToCourses();
  });
}




page.open("https://www.france-universite-numerique-mooc.fr/login",signIn);
