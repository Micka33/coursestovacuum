//Dependencies
var express           = require('express'),
    app               = express(),
    _                 = require('underscore'),
    server            = require('http').createServer(app),
    io                = require('socket.io').listen(server),
    redis             = require('redis'),
    moment            = require('moment'),
    yaml              = require('js-yaml'),
    fs                = require('fs');

//Configuation
var pubsub_prefix     = 'socketio.',
    redis_conf        = yaml.safeLoad(fs.readFileSync('./redis.yml', 'utf8')),
    node_env          = process.env.NODE_ENV          || 'development',
    port              = redis_conf[node_env]['port']  || 6379,
    host              = redis_conf[node_env]['host']  || 'localhost',
    commander_redis   = redis.createClient(port, host);

var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};

// Not binding the 'error' event will cause node to stop when Redis is unreachable
commander_redis.on('error',   function (err)  {log('La connection à Redis a échoué: ['+err+']');});





// ASYNC JOBS
var async             = require('async'),
    spawn             = require('child_process').spawn,
    jobs              = 1;  // typically a command line option, because it is unique
                            // to the machine
function setup_job(opts, done)
{
  log('starting '+opts.params[opts.params.length - 1]);
  var params = opts.params;
  var bin = opts.bin;
  var field = opts.bin+' '+opts.params.join(' ');
  delete opts['params'];
  delete opts['bin'];
  var R = spawn(bin, params, opts);
  R.stdout.on('data',function(buf) {});
  R.stderr.on('data',function(buf) {});
  R.on('exit',function(code)
  {
    log('got exit code: '+code)
    commander_redis.HDEL('coursestovacuum_jobs', field, function() {
      commander_redis.HLEN('coursestovacuum_jobs', function(err, len) {
        if ((len == 0) && (field != 'ruby ../getSubtitles.rb'))
          jobForCourses([{params:'../getSubtitles.rb', bin: 'ruby'}]);
      });
    });
    if(code==1)
      done();
    else
      done();
    return null;
  });
  return null;
}
var course_queue=async.queue(setup_job, jobs);

//instaciante jobs
var jobForCourses = function(cmds) {
  // baseline options for every job
  for (var i = cmds.length - 1; i >= 0; i--) {
    var opts = {  cwd: __dirname,
                  env: process.env,
                  params: cmds[i].params,
                  bin: cmds[i].bin
               };
    commander_redis.HSET('coursestovacuum_jobs', opts.bin+' '+opts.params.join(' '), true);
    log('queueing: '+opts.bin+' '+opts.params.join(' '));
    course_queue.push(opts);
  };
};



io.sockets.on('connection', function (socket) {

  socket.on('course_job', function (data)
  {
    if ('cmds' in data)
      jobForCourses(data.cmds);
  });

  socket.on('save_content', function (data)
  {
    if ('courses' in data)
    {
      log('courses to save: '+data.courses.course_name+', '+data.courses.chapter);
      if (commander_redis.connected)
      {
        commander_redis.RPUSH('france-universite-numerique-mooc', data.courses.course_name);
        commander_redis.RPUSH(data.courses.course_name, data.courses.course_name+'[_-_]'+data.courses.session);
        commander_redis.HSET(data.courses.course_name+'[_-_]'+data.courses.session, data.courses.chapter, JSON.stringify(data.courses.parts));
      }
    }
  });

});

server.listen(8811, 'localhost');
log("listenning on localhost:8811");












