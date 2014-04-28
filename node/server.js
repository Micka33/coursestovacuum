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

app.use(express.static(__dirname+"/site"));

//Configuation
var pubsub_prefix     = 'socketio.',
    redis_conf        = yaml.safeLoad(fs.readFileSync('./redis.yml', 'utf8')),
    node_env          = process.env.NODE_ENV          || 'development',
    port              = redis_conf[node_env]['port']  || 6379,
    host              = redis_conf[node_env]['host']  || 'localhost',
    //A connection to redis is either in "subscriber" mode or "regular" mode
    //So we have both a "subcriber" client and "regular" client
    // subscriber_redis  = redis.createClient(port, host),
    commander_redis   = redis.createClient(port, host);

var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};

// Not binding the 'error' event will cause node to stop when Redis is unreachable
commander_redis.on('error',   function (err)  {log('La connection à Redis a échoué: ['+err+']');});
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
    jobs              = 6;  // typically a command line option, because it is unique
                            // to the machine
function setup_R_job(opts,done)
{
  log('starting '+opts.params[opts.params.length - 1]);
  var params = opts.params;
  var bin = opts.bin;
  delete opts['params'];
  delete opts['bin'];
  var R = spawn(bin, params, opts);
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
var jobForCourses = function(cmds) {
  // baseline options for every job
  for (var i = cmds.length - 1; i >= 0; i--) {
    var opts = {  cwd: __dirname,
                  env: process.env,
                  params: cmds[i].params,
                  bin: cmds[i].bin
               };
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
        commander_redis.RPUSH('france-universite-numerique-mooc', data.courses.course_name)
        commander_redis.RPUSH(data.courses.course_name, data.courses.course_name+'[_-_]'+data.courses.session)
        commander_redis.HSET(data.courses.course_name+'[_-_]'+data.courses.session, data.courses.chapter, JSON.stringify(data.courses.parts))
      }
    }
  });

  socket.on('redis_command', function (data, fn)
  {
    if ('redis' in data)
    {
      log('redis command to execute['+data.chan+']:  '+data.redis.join(' '));
      if (commander_redis.connected)
      {
        commander_redis.multi([ data.redis ]).exec(function (err, replies)
        {
          if (err)
            socket.emit('redis_command_disapproved', {id:data.chan, err:err});
          else
          {
            socket.emit(data.chan, {replies:replies});
            if ((fn != null) && (typeof fn != 'undefined'))
              fn('ok');
          }
        });
      }
    }
  });

});

server.listen(8890, 'localhost');
log("listenning on localhost:8890");












