// Whole-script strict mode syntax
"use strict";

var email = 'ericgay@yopmail.com';
var pwd = 'Ericgay94';
var sParProfile = 60;
var maxDelayPerRequest = 30;
var url = 'https://www.france-universite-numerique-mooc.fr';

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
var getHref = function(sel)
{
  return page.evaluate(function(sel) {
    return $(sel).attr('href');
  }, sel);
};












if (((args.course == undefined) && (args.c == undefined)))
{
  console.log('Usage: crawl.js --course /courses/Paris11/15001/Trimestre_2_2014/about');
  console.log('       crawl.js -c /courses/Paris11/15001/Trimestre_2_2014/about');
  exit();
}
var courseUrl = (args.course != undefined)?(args.course):(args.c);

















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
var getCourseLinks = function()
{
  var links = page.evaluate(function(sel) {
    var links = [];
    $(sel).each(function(index, element) {
      links.push($(element).attr('href'));
    });
    return links;
  }, '.chapter li a');

  for (var i = links.length - 1; i >= 0; i--) {
    console.log("phantomjs ./getLinkContent.js --link "+links[i]);
  };
  exit();
}
var crawl = function()
{
  if (hasDiv('.main-cta .register.disabled'))
  {
    log(url+getHref('.main-cta a'));
    page.open(url+getHref('.main-cta a'), function()
    {
      var urltoexpect = url+getHref('body > section.content-wrapper > nav > div > ol > li:nth-child(1) > a');
      page.open(urltoexpect, getCourseLinks);
    });
  }
  else
  {
    log(email+' is not registered to '+courseUrl);
    exit();
  }

}
var goToCourse = function()
{
  log('Ouverture de '+courseUrl+'.');
  page.open(url+courseUrl, crawl);
}
var signIn = function()
{
  log('Connexion en tant que '+email+'.');
  fillAndsubmit('form#login-form',
    [['email', email],
     ['password', pwd]
    ]
  );
  waittil(url+'/dashboard', maxDelayPerRequest, function()
  {
    log('Connexion réussie ! :D');
    goToCourse();
  });
}




page.open(url+"/login",signIn);
