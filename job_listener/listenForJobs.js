//Dependencies
var _                 = require('underscore'),
    redis             = require('redis'),
    moment            = require('moment'),
    yaml              = require('js-yaml'),
    fs                = require('fs');

//Configuation
var redis_conf        = yaml.safeLoad(fs.readFileSync('../node/redis.yml', 'utf8')),
    node_env          = process.env.NODE_ENV          || 'development',
    port              = redis_conf[node_env]['port']  || 6379,
    host              = redis_conf[node_env]['host']  || 'localhost',
    commander_redis   = redis.createClient(port, host),
    subscriber_redis  = redis.createClient(port, host);

var log = function(msg) {console.log('['+moment().format('h:mm:ss a')+'] '+msg);};
var runningJobs = [];

// Not binding the 'error' event will cause node to stop when Redis is unreachable
commander_redis.on('error',   function (err)  {log('La connection à Redis a échoué: ['+err+']');});
subscriber_redis.on('error',  function (err)  {log('La connection à Redis a échoué: ['+err+']');});

// ASYNC JOBS
var async             = require('async'),
    spawn             = require('child_process').spawn,
    jobs              = 10;  // typically a command line option, because it is unique
// to the machine
function launch_job(opts, done)
{
    log('starting '+opts.params[opts.params.length - 1]);
    var params = opts.params;
    var bin = opts.bin;
    var field = {params: params,
                 bin: bin
    };
    delete opts['params'];
    delete opts['bin'];
    commander_redis.HSET('coursestovacuum_jobs', JSON.stringify(field), 'running', function(err, affected_rows) {
        if (err == null) {
            var R = spawn(bin, params, opts);
            R.stdout.on('data',function(buf) {});
            R.stderr.on('data',function(buf) {});
            R.on('error',function(err) {log('It is most likely that phantomjs is not installed.');console.log(err);});
            R.on('exit' ,function(code)
            {
                log('got exit code: '+code);
                commander_redis.HDEL('coursestovacuum_jobs', JSON.stringify(field), function() {
                    commander_redis.HLEN('coursestovacuum_jobs', function(err, len) {
                        if ((len == 0) && (field.bin != 'ruby'))
                            queue_job([{params:'../getSubtitles.rb', bin: 'ruby'}]);
                    });
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
var course_queue=async.queue(launch_job, jobs);



var queue_job = function(cmd)
{
    /*
     {   cwd: __dirname,
     env: process.env,
     params: cmds[i].params,
     bin: cmds[i].bin
     }
     */
    cmd.cwd = __dirname;
    cmd.env = process.env;
    course_queue.push(cmd);
    log('queued['+jobs[key]+']: '+cmd.bin+' '+cmd.params.join(' '));
};

var fetch_and_instanciate_jobs = function(values_to_launch) {
    commander_redis.HGETALL('coursestovacuum_jobs', function(err, jobs)
    {
        for (var key in jobs) {
            if (jobs.hasOwnProperty(key) && (_.indexOf(values_to_launch, jobs[key]) != -1)) {
                log(jobs[key]+":"+key);
                commander_redis.HSET('coursestovacuum_jobs', key, 'queued', function(err, affected_rows)
                {
                    if (err == null)
                      queue_job(JSON.parse(key));
                });
            }
        }
    });
};


subscriber_redis.on('ready',  function ()     {log('subscriber_redis est prêt à recevoir des requêtes.');

    subscriber_redis.on('message', function(channel) {
        if (channel == 'coursestovacuum_jobs')
            fetch_and_instanciate_jobs(['not queued']);
    });
    subscriber_redis.subscribe('coursestovacuum_jobs');

});

commander_redis.on('ready',  function ()     {log('commander_redis est prêt à recevoir des requêtes.');
    fetch_and_instanciate_jobs(['running', 'not queued', 'queued']);
});





















