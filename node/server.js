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
    commander_redis   = redis.createClient(port, host),
    subscriber_redis  = redis.createClient(port, host);

var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};

// Not binding the 'error' event will cause node to stop when Redis is unreachable
commander_redis.on('error',   function (err)  {log('La connection à Redis a échoué: ['+err+']');});
subscriber_redis.on('error',  function (err)  {log('La connection à Redis a échoué: ['+err+']');});


var stackJobs = function(cmds) {
  // baseline options for every job
  for (var i = cmds.length - 1; i >= 0; i--) {
    var opts = {  params: cmds[i].params,
                  bin: cmds[i].bin
               };
    commander_redis.HSET('coursestovacuum_jobs', JSON.stringify(opts), 'not queued');
    subscriber_redis.publish('coursestovacuum_jobs', 'New job available');
    log('registered: '+opts.bin+' '+opts.params.join(' '));
  }
};


io.sockets.on('connection', function (socket) {

  socket.on('course_job', function (data)
  {
    if ('cmds' in data)
      stackJobs(data.cmds);
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












