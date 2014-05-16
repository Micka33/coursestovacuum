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
var waittilelementhasclass = function(element, classToCheck, delay, then, params) {
  var start = moment();
  var intervalID = window.setInterval(function()
  {
    if ((moment().diff(start, 'seconds') > delay) ||
        (hasClass(element, classToCheck))
      )
    {
      clearInterval(intervalID);
      then(params);
    }
  },
  200);
};
var waittime = function(delay, then, params) {
  var start = moment();
  var intervalID = window.setInterval(function()
  {
    if (moment().diff(start, 'seconds') > delay)
    {
      clearInterval(intervalID);
      then(params);
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
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
  if (msg == "exit phantomjs.")
    window.setTimeout(exit, 2000);
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
var getText = function(sel)
{
  return page.evaluate(function(sel) {
    return $(sel).text();
  }, sel);
};











if (((args.link == undefined) && (args.l == undefined)))
{
  console.log('Usage: crawl.js --link /courses/Paris11/15001/Trimestre_2_2014/courseware/f6b07f152dd542f8a74a73336e2f3485/9f0f85032c8544bea3f60aae7166f70f/');
  console.log('       crawl.js -l /courses/Paris11/15001/Trimestre_2_2014/courseware/f6b07f152dd542f8a74a73336e2f3485/9f0f85032c8544bea3f60aae7166f70f/');
  exit();
}
var courseLink = (args.link != undefined)?(args.link):(args.l);













//DATABASE UTILITIES
var saveCourse = function(crs)
{
  // Separating base and parts, having all of it together causes issues.
  // Why? Because of reasons.
  var parts = crs.parts;
  var base = crs;
  delete base.parts;
  page.evaluate(function(base, parts)
  {
      var courses = JSON.parse(base);
      courses.parts = JSON.parse(parts)
    var id = null;
    var fireWhenReady = function ()
    {
      if (typeof io != 'undefined')
      {
        if (id != null)
          clearTimeout(id);
        var socket = io.connect('http://localhost:8811/');
        socket.on('connect', function ()
        {
          socket.emit('save_content', { courses:JSON.parse(courses) });
          console.log('exit phantomjs.');
        });
      }
      else
        id = setTimeout(fireWhenReady, 100);
    };
    fireWhenReady();
  }, JSON.stringify(base), JSON.stringify(parts));

};




// phantomjs getChapterContent.js --link /courses/VirchowVillerme/06003/Trimestre_1_2014/courseware/ec69233ec6bb476ab86a54905374a0c0/e16432570f3545f786cb6c7691e648b6/
// phantomjs getChapterContent.js --link /courses/VirchowVillerme/06003/Trimestre_1_2014/courseware/ec69233ec6bb476ab86a54905374a0c0/be73cc6ee4b44a1086cdca336bd68ef3/
// phantomjs getChapterContent.js --link /courses/VirchowVillerme/06003/Trimestre_1_2014/courseware/ec69233ec6bb476ab86a54905374a0c0/607e2e313ac24291a939c151b2da947a/
// phantomjs getChapterContent.js --link /courses/VirchowVillerme/06003/Trimestre_1_2014/courseware/ec69233ec6bb476ab86a54905374a0c0/83471a2b41a140c78565c5f3dbb60796/
// phantomjs getChapterContent.js --link /courses/VirchowVillerme/06003/Trimestre_1_2014/courseware/ec69233ec6bb476ab86a54905374a0c0/8de414dd64e045a099c0555975bbe106/




var getPart = function() 
{
  return page.evaluate(function(){
    return {  title: $('.course-content  h2').text(),
              videos: (function(){
                        var hash = {};
                        $('.course-content .vert-mod .video-sources a').each(function(index, element){
                          var key = $(element).text();
                          var url = $(element).attr('href');
                          hash[key] = url;
                        });
                        return hash;
                      })(),
              videosub: (function(){
                          var sel = '.course-content .vert-mod li[data-id*="video"] .video';
                          if ($(sel).attr('data-caption-asset-path') != undefined)
                            return {
                              urljson: $(sel).attr('data-caption-asset-path')+$(sel).attr('data-sub')+'.srt.sjson',
                              json:'',
                              text:''
                            };
                          return null;
                          // var text = '';
                          // $('.course-content .vert-mod li[data-id*="video"] ol.subtitles.html5 li').each(function(i, el) {
                          //  text += ' '+$(el).text();
                          // });
                          // return text;
                        })(),
              html:(function(){
                      var id_to_remove = [];
                      $('.course-content .vert-mod li[data-id*="video"]').each(function(index, element){
                        id_to_remove.push(element.id);
                      });
                      var html = [];
                      $('.course-content .vert-mod li').each(function(index, element){
                        if ((id_to_remove.indexOf(element.id) < 0) &&
                            ($(element).text().indexOf("<article class=\"discussion-article\"") < 0))
                          html.push($(element).html());
                      });
                      return html;
                    })()
    }
  });
}
//
// Algo
//
var getParts = function(nbParts, content)
{
  if (nbParts > 0)
  {
    var element = "#sequence-list li:nth-child("+(nbParts).toString()+") a";
    click(element, true);
    waittilelementhasclass(element, "active", maxDelayPerRequest, function()
    {
      content.parts.push(getPart());
      log("Now have "+content.parts.length.toString()+" parts pushed inside.");
      getParts(nbParts - 1, content);
    });
  }
  else if (nbParts == 0)
    saveCourse(content)
};
var crawl = function()
{
  var content = {course_name:null, chapter:null, parts:[]}
  content.course_name = getText('header.global h2').replace(/&nbsp;/gi, ' ').replace(/\n/gi, '').trim();
  content.session = getText('.chapter.is-open h3').replace(/&nbsp;/gi, ' ').replace(/\n/gi, '').trim()
  content.chapter = getText('.chapter.is-open li.active a').replace(', current section', '').replace(/&nbsp;/gi, ' ').replace(/\n/ig, '').trim();
  var nbParts = page.evaluate(function(sel){return $(sel).length;}, '#sequence-list li');
  getParts(nbParts, content);
};
var goToCourse = function()
{
  log('Ouverture de '+courseLink+'.');
  page.open(url+courseLink, crawl);
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
    goToCourse();
  });
};




page.open(url+"/login",signIn);
