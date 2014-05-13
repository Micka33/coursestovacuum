// Whole-script strict mode syntax
"use strict";

var email = 'ericgay@yopmail.com';
var pwd = 'Ericgay94';
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
      var selector = form+' [name='+names[i][0]+']';
      if ($(selector).is('select'))
        $(selector+" option").filter(function() {
          return $.trim($(this).text()) === $.trim(names[i][1]);
        }).prop('selected', true);
      else if ($(selector).is('input'))
        $(selector).val(names[i][1]);
    }
    $(form).submit();
  }, form, names);
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
  page.includeJs('http://localhost:8811/socket.io/socket.io.js');
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
page.onConsoleMessage = function(msg, lineNum, sourceId) {
//  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
  if (msg == "exit phantomjs.")
    window.setTimeout(exit, 2000);
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















//Clearing args parameter from memory and freezing it, since we won't use it anymore.
args.email = 'nothingtoseeherejustclearing1thistobesurenoonereaditinmemory';
args.e = 'nothingtoseeherejustclearingthis2tobesurenoonereaditinmemory';
args.password = 'nothingtoseeherejustclear3ingthistobesurenoonereaditinmemory';
args.p = 'nothingtoseeherejustclearingthis4tobesurenoonereaditinmemory';
Object.freeze(args);

















//DATABASE UTILITIES
var sendCmds = function(cmds) {
  page.evaluate(function(cmds) {
    var id = null;
    var fireWhenReady = function () {
        if (typeof io != 'undefined') {
          if (id != null)
            clearInterval(id);
          var socket = io.connect('http://localhost:8811/');
          socket.on('connect', function () {
            socket.emit('course_job', { cmds:JSON.parse(cmds) });
            console.log('exit phantomjs.');
          });
        }
        else {
          id = setTimeout(fireWhenReady, 100);
        }
    };
    fireWhenReady();
  }, JSON.stringify(cmds));
};










//
// Algo
//
var getLinks = function()
{
  log('Récupération de la liste des cours.');
  // If there is no results displayed
  var coursesLinks = getCoursesLinks();
  var cmds = [];
  for (var i = coursesLinks.length - 1; i >= 0; i--) {
    cmds.push({ bin: "phantomjs",
                params: ['../getCourseChapters.js','--course', coursesLinks[i]]
              });
  }
  sendCmds(cmds);
};
var goToCourses = function()
{
  log('Affichage des cours.');
  click('body > header > nav > ol.left.nav-global.authenticated > li > ul > li:nth-child(3) > a');
  waittil(url+'/courses', maxDelayPerRequest, function(loaded)
  {
    if (loaded)
      getLinks();
    else
    {
      log('Impossible de charger la page de recherche. :\'(');
      exit();
    }
  });
};
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
    goToCourses();
  });
};




page.open(url+'/login',signIn);
