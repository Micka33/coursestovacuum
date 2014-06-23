# ALL IN A DOCKER CONTAINER

## How to build/run

```bash
> git clone -b Docker https://github.com/Micka33/coursestovacuum.git .
> docker build --tag edx .
```



## Run as a deamon

```bash
> docker run --name edx -v ./data:/root/coursestovacuum edx /sbin/my_init --quiet
```



## Inspect the VM

```bash
> docker run -v ./data:/root/coursestovacuum -t -i edx /sbin/my_init -- bash -l
```



## Trouble with Docker on Mac ? Use vagrant !

Follow the instructions here [https://github.com/Micka33/coursestovacuum/tree/Docker](https://github.com/Micka33/coursestovacuum/tree/Docker).  
