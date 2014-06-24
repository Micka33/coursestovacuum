# Redis

##Build it

```bash
> sudo docker build --tag redis .
```


## Run it

### As a deamon

```bash
> sudo docker run --name redis -d -p 0.0.0.0:6379:6379 -v `pwd`/../datas/:/datas redis /sbin/my_init --quiet
```

### To inspect the VM

```bash
> sudo docker run -p 0.0.0.0:6379:6379 -v `pwd`/../datas/:/datas -t -i redis /sbin/my_init -- bash -l
```


### To connect using SSH

```bash
# Run with --enable-insecure-key
> sudo docker run --name redis -d -p 0.0.0.0:6379:6379 -v `pwd`/../datas/:/datas redis /sbin/my_init --quiet --enable-insecure-key

# Now SSH into the container as follows:
> curl -o insecure_key -fSL https://github.com/phusion/baseimage-docker/raw/master/image/insecure_key && chmod 600 insecure_key
> ssh -i insecure_key root@`sudo docker inspect -f "{{ .NetworkSettings.IPAddress }}" redis`
```

## To check that Redis is running
```bash
> sv status redis
run: redis: (pid XX) XXs
```
