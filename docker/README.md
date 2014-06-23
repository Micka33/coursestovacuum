# ALL IN A DOCKER CONTAINER

## How to build/run

```bash
> git clone -b Docker https://github.com/Micka33/coursestovacuum.git .
> docker build --tag edx/edx .
```



## Run as a deamon

```bash
> docker run --name edx -v ./data:/data edx/edx /sbin/my_init --quiet
```



## Run inline

```bash
> docker run -v ./data:/data edx/edx /sbin/my_init --quiet
```



## Trouble with Docker on Mac ? Use vagrant !

Follow the instructions here [https://github.com/Micka33/coursestovacuum/tree/Docker](https://github.com/Micka33/coursestovacuum/tree/Docker).  
