# ALL IN A DOCKER CONTAINER

## How to build/run

```bash
> git clone -b Docker https://github.com/Micka33/coursestovacuum.git .
> sudo docker build --tag edx .
```



## Run as a deamon

```bash
> sudo docker run --name edx -d -p 0.0.0.0:8282:8282 -v `pwd`/src/:/root/coursestovacuum -v `pwd`/datas/:/datas edx /sbin/my_init --quiet
```

## Inspect the VM

```bash
> sudo docker run -p 0.0.0.0:8282:8282 -v `pwd`/src/:/root/coursestovacuum -v `pwd`/datas/:/datas -t -i edx /sbin/my_init -- bash -l
```


## Connect using SSH

```bash
# Run with --enable-insecure-key
> sudo docker run --name edx -d -p 0.0.0.0:8282:8282 -v `pwd`/src/:/root/coursestovacuum -v `pwd`/datas/:/datas edx /sbin/my_init --quiet --enable-insecure-key

# Now SSH into the container as follows:
> curl -o insecure_key -fSL https://github.com/phusion/baseimage-docker/raw/master/image/insecure_key && chmod 600 insecure_key
> ssh -i insecure_key root@`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" edx`

# Once connected install the last dependencies
> cd coursestovacuum && sh install.sh && cd rails/elasticsearh_api/ && bundle install
```



## Trouble with Docker on Mac ? Use vagrant !

Follow the instructions here [https://github.com/Micka33/coursestovacuum/tree/Docker](https://github.com/Micka33/coursestovacuum/tree/Docker).  
