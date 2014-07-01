# coursestovacuum


## Dependencies

 - NodeJS ([http://nodejs.org/download/](http://nodejs.org/download/))  
 - Ruby ([https://rvm.io/](https://rvm.io/))  
 - PhantomJS ([http://phantomjs.org/download.html](http://phantomjs.org/download.html))  
 - Redis ([http://redis.io/](http://redis.io/))  
 - ElasticSearch ([http://www.elasticsearch.org/download/](http://www.elasticsearch.org/download/))  

Currenlty the Redis package is outdated.  
Currently the NodeJS package is outdated.  
For the previous reasons, and safety, all dependencies have to be installed using the provided urls.  

Once your done with the dependencies, run `install.sh` to finnish the installation

## how to get all the courses

1. Run redis
 ```bash
 /> redis-server
 ```

2. Run the job listener
 ```bash
 /> cd job_listener
 /job_listener/> node listenForJobs.js
 ```

3. run the nodeJS server
 ```bash
 /> cd node
 /node/> node server.js #or npm start
 ```

4. run the following script
 ```bash
 /> phantomjs getCourses.js #or npm start
 ```
 

You might need to stop and restart `listenForJobs.js` many times during the process, as it happens to stop for no apparent reasons.  
If it doesn't instanciate any job for 5min, it is either stucked or there is no more jobs awaiting to be launched.  

