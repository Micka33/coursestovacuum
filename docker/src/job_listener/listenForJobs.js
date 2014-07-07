//Dependencies
var _                 = require('underscore'),
    redis             = require('redis'),
    moment            = require('moment'),
    yaml              = require('js-yaml'),
    fs                = require('fs'),
    crypto            = require('crypto');

//Configuation
var courses_jobs_key  = 'coursestovacuum_jobs',
    redis_conf        = yaml.safeLoad(fs.readFileSync('/datas/node/redis.yml', 'utf8')),
    node_env          = process.env.NODE_ENV                            || 'development',
    port              = process.env.REDIS_1_PORT_6379_TCP_PORT          || redis_conf[node_env]['port'],
    host              = process.env.REDIS_1_PORT_6379_TCP_ADDR          || redis_conf[node_env]['host'],
    commander_redis   = redis.createClient(port, host),
    subscriber_redis  = redis.createClient(port, host);


var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};
var runningJobs = [];

// Not binding the 'error' event will cause node to stop when Redis is unreachable
commander_redis.on('error',   function (err)  {log('[commander_redis] La connection à Redis a échoué: ['+err+']');});
subscriber_redis.on('error',  function (err)  {log('[subscriber_redis] La connection à Redis a échoué: ['+err+']');});

// ASYNC JOBS
var async             = require('async'),
    spawn             = require('child_process').spawn,
    max_jobs          = 2;  // typically a command line option, because it is unique to the machine

function launch_job(opts, done)
{
    var params = opts.params;
    var bin = opts.bin;
    opts.state = 'running';
    log('running '+opts.key);
    commander_redis.HSET('coursestovacuum_jobs', opts.key, JSON.stringify(opts), function(err, nb_affected_rows) {
        if (err == null) {
            var R = spawn(bin, params, {cwd: __dirname,env: process.env});
            var watchout = function(buf) {
                if (buf.indexOf('SyntaxError: Parse error') > -1) {
                    opts.state = 'ignored';
                    commander_redis.HSET('coursestovacuum_jobs', opts.key, JSON.stringify(opts), function(err, nb_affected_rows) {
                      log('['+opts.key+'] is ignored.('+buf+', '+nb_affected_rows+')');
                    });
                    done();
                }
                log(buf);
            };
            R.stdout.on('data',watchout);
            R.stderr.on('data',watchout);
            R.on('error',function(err) {log('It is most likely that phantomjs is not installed.');console.log(err);});
            R.on('exit' ,function(code)
            {
                log('got exit code: '+code);
                if (opts.key != 'none')// If we are not executing [getSubtitles.rb]
                    commander_redis.HDEL('coursestovacuum_jobs', [opts.key], function(err, nb_affected_rows) {
                        log('['+opts.key+'] is done.('+err+', '+nb_affected_rows+')');
                        // commander_redis.HLEN('coursestovacuum_jobs', function(err, len) {
                        //     if (len == 0)
                        //         queue_job({params: '../getSubtitles.rb', bin: 'ruby', key:'none'});
                        // });
                    });
                if(code==1) {
                    done();
                }
                else
                    done();
                return null;
            });

        }

    });
    return null;
}
var job_queue=async.queue(launch_job, max_jobs);



var queue_job = function(cmd)
{
    /*
     {   cwd: __dirname,
     env: process.env,
     params: cmds[i].params,
     bin: cmds[i].bin
     }
     */
    var oldState = cmd.state;
    cmd.state = 'queued';
    commander_redis.hset('coursestovacuum_jobs', cmd.key, JSON.stringify(cmd), function(err, nb_affected_rows)
    {
        if (err == null)
        {
            job_queue.push(cmd);
            log('queued[' + oldState + ']: ' + cmd.bin + ' ' + cmd.params.join(' '));
        }
    });
};

var fetch_and_instanciate_jobs = function(values_to_launch) {
    commander_redis.HGETALL('coursestovacuum_jobs', function(err, jobs)
    {
        for (var key in jobs)
        {
            cmd = JSON.parse( jobs[key]);
            if (jobs.hasOwnProperty(key) && (_.indexOf(values_to_launch, cmd.state) != -1))
                queue_job(cmd);
        }
    });
};

subscriber_redis.on('ready',  function ()  {log('subscriber_redis est prêt à recevoir des requêtes.');

    subscriber_redis.on('message', function(channel) {
        if (channel == 'coursestovacuum_jobs')
            fetch_and_instanciate_jobs(['not queued']);
    });
    subscriber_redis.subscribe('coursestovacuum_jobs');

});

commander_redis.on('ready',  function ()     {log('commander_redis est prêt à recevoir des requêtes.');
    fetch_and_instanciate_jobs(['running', 'not queued', 'queued']);
});






















