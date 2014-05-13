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
    commander_redis   = redis.createClient(port, host);

var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};

// Not binding the 'error' event will cause node to stop when Redis is unreachable
commander_redis.on('error',   function (err)  {log('La connection à Redis a échoué: ['+err+']');});


io.sockets.on('connection', function (socket) {

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
log('listenning on localhost:8890');












