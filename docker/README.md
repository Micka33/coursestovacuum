# Dependencies

1. Docker ([https://docs.docker.com/installation/](https://docs.docker.com/installation/))
2. Fig ([http://orchardup.github.io/fig/install.html](http://orchardup.github.io/fig/install.html))

# Build them

```bash
/docker/> sudo fig build
```

# Run it !

The whole process takes up to a day (easy).  

## SHORT VERSION

```bash
/docker/> sudo fig up -d mongod elastic redis
/docker/> sudo fig up -d nodeserver sidekiq railsserver
/docker/> sudo fig up -d job nginx
/docker/> sudo fig up firstjob
#wait for the job container to be done (0 jobs left)
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/how_many_jobs_left
{"jobs_left":0}
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/migration/start
{created:...}
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/migration/download_videos
{created:...}
# You can now request the rails API!
```

## LONG VERSION

### Get the courses

1. First launch the databases.  

    ```bash
    /docker/> sudo fig up -d mongod elastic redis
    ```
2. Then launch the [node server][nserver] and the [job listener][job] (they depend on redis).  

    ```bash
    /docker/> sudo fig up -d job nodeserver
    ```
3. finally Launch the [first job][gcourses].  

    ```bash
    /docker/> sudo fig up firstjob
    ```

The [first job][gcourses] is a quick one, it gets all the courses url, associates them with [`getCourseChapters.js`][gcchapters] and asks the [node server][nserver] to store them into redis.  
Besides [job listener][job] is watching redis for new jobs to instanciate.  

#### Some more info about the jobs

1. The [first job][gcourses] get the courses url and create [`getCourseChapters.js`][gcchapters] jobs.  
2. The [`getCourseChapters.js`][gcchapters] jobs get the chapters and create [`getChapterContent.js`][gcccontent] jobs.  
3. The [`getChapterContent.js`][gcccontent] jobs get the contents of a chapter and ask the [node server][nserver] to store them into redis.  

#### Accelerate things

More than 1000 jobs will be created and executed, it takes a long while.  
To increase the jobs concurrencies change [this value](https://github.com/Micka33/coursestovacuum/blob/Docker/docker/src/job_listener/listenForJobs.js#L29).  

#### Issue with the job listener

From time to time the [job listener][job] stop instanciating jobs.  
It occurs because a number of phantomjs jobs get stucked (network, to much intancies of phantomjs simultaneously, phantomjs fails at parsing some json).  
To by-pass the problem, you need to stop and relaunch the [job listener][job] container.  

```bash
/docker/> sudo fig stop job && sudo fig up -d job
```

### Get the rails api to work (when all jobs are done)

First launch the [railsserver](https://github.com/Micka33/coursestovacuum/tree/Docker/docker/src/rails/elasticsearh_api), then sidekiq and nginx.  

```bash
/docker/> sudo fig up -d railsserver
/docker/> sudo fig up -d sidekiq nginx
```


#### How to know all the jobs are done ?
When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/how_many_jobs_left
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/how_many_jobs_left
{"jobs_left":0}
/docker/>
```

#### PhantomJS fail on a job, how to ignore it
When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/ignore_a_job/c2981c929c429be3cd893be60737df45
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/ignore_a_job/c2981c929c429be3cd893be60737df45
{"jobs_left":0}
/docker/>
```

`c2981c929c429be3cd893be60737df45` being the job's id.  
When PhantomJS get stucked on a job, find the first line looking like the one below, ignore it with the url and relaunch using `sudo fig up -d job`
```bash
job_1 | [9:01:59 am] running c2981c929c429be3cd893be60737df45
```


#### Migrate the datas from redis to mongod (indexed in elasticsearch)
When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/migration/start
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/migration/start
{created:...}
/docker/>
```

#### download the associated videos (Once all datas are migrated)
When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/migration/download_videos
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/migration/download_videos
{created:...}
/docker/>
```

#### generate the thumbnails (Once all videos are downloaded)
When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/migration/create_video_thumbnails
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/migration/create_video_thumbnails
{created:...}
/docker/>
```


### Request the rails api

#### Get all
When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/
{"nb_courses":0,"nb_videos":0,"courses":[]}
/docker/>
```

#### Search using keywords/expressions

When using vagrant, consult the following url (Adapt the IP adress if your not using vagrant) :
```
http://172.17.8.100:8282/search/science+multimedia
```

In either way you can use this command :
```bash
/docker/> curl http://`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" coursestovacuum_railsserver_1`:8282/search/science+multimedia
{"params":"science+multimedia","result":[...]}
/docker/>
```



## Trouble with Docker on Mac ? Use vagrant !

Follow the instructions here [https://github.  com/Micka33/coursestovacuum/tree/Docker](https://github.com/Micka33/coursestovacuum/tree/Docker).  


[job]: https://github.com/Micka33/coursestovacuum/blob/Docker/docker/src/job_listener/listenForJobs.js

[nserver]: https://github.com/Micka33/coursestovacuum/blob/Docker/docker/src/node/server.js

[gcourses]: https://github.com/Micka33/coursestovacuum/blob/Docker/docker/src/getCourses.js

[gcchapters]: https://github.com/Micka33/coursestovacuum/blob/Docker/docker/src/getCourseChapters.js

[gcccontent]: https://github.com/Micka33/coursestovacuum/blob/Docker/docker/src/getChapterContent.js
