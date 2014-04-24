//Dependencies
var app               = require('express')(),
    _                 = require('underscore'),
    server            = require('http').createServer(app),
    io                = require('socket.io').listen(server),
    redis             = require('redis'),
    moment            = require('moment'),
    yaml              = require('js-yaml'),
    fs                = require('fs');

//Configuation
// var pubsub_prefix     = 'socketio.',
//     redis_conf        = yaml.safeLoad(fs.readFileSync('./redis.yml', 'utf8')),
//     node_env          = process.env.NODE_ENV          || 'development',
//     port              = redis_conf[node_env]['port']  || 6379,
//     host              = redis_conf[node_env]['host']  || 'localhost',
//     //A connection to redis is either in "subscriber" mode or "regular" mode
//     //So we have both a "subcriber" client and "regular" client
//     subscriber_redis  = redis.createClient(port, host),
//     commander_redis   = redis.createClient(port, host);

var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};

// // Not binding the 'error' event will cause node to stop when Redis is unreachable
// commander_redis.on('error',   function (err)  {log('La connection à Redis a échoué: ['+err+']');});
// subscriber_redis.on('error',  function (err)  {log('La connection à Redis a échoué: ['+err+']');});
// subscriber_redis.on('end',    function ()     {log('La connection à Redis a été coupé.');});
// subscriber_redis.on('ready',  function ()     {log('Redis est prêt à recevoir des requêtes.');
//   // subscriber_redis.psubscribe(pubsub_prefix + '*');
//   // subscriber_redis.on('pmessage',function(pat, ch, msg) {
//   //   log('subscriber_redis: pat:'+JSON.stringify(pat)+' ch:'+JSON.stringify(ch)+' msg:'+JSON.stringify(msg));
//   //   io.sockets.in(ch).send(msg);
//   // });
// });





// ASYNC JOBS
var async             = require('async'),
    spawn             = require('child_process').spawn
    jobs              = 4;  // typically a command line option, because it is unique
                            // to the machine
function setup_R_job(opts,done)
{
  log('starting '+opts.params.pop());
  var params = opts.params;
  delete opts['params'];
  var R = spawn('phantomjs', params, opts);
  // R.stdout.on('data',function(buf) {
  //   console.log("out:"+buf);
  // });
  // R.stderr.on('data',function(buf) {
  //   console.log("err:"+buf);
  // });
  R.on('exit',function(code)
  {
    log('got exit code: '+code)
    if(code==1)
    {
      // do something special
      done();
    }
    else
    {
      done();
    }
    return null;
  })
  return null;
}
var course_queue=async.queue(setup_R_job, jobs);

//instaciante jobs
var jobForCourses = function(urls) {
  // baseline options for every job
  for (var i = urls.length - 1; i >= 0; i--) {
    var opts = {  cwd: __dirname,
                  env: process.env,
                  params: ['../getCourseLinks.js','--course']
               };
    opts.params.push(urls[i]);
    log("queueing: "+opts.params.join(' '));
    course_queue.push(opts);
  };
};



io.sockets.on('connection', function (socket) {

  socket.on('course_job', function (data)
  {
    if ('urls' in data)
      jobForCourses(data.urls);
  });

});

server.listen(8890, 'localhost');
log("listenning on localhost:8890");












