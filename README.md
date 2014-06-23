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

1. Download Vagrant ([https://www.vagrantup.com/downloads.html](https://www.vagrantup.com/downloads.html))
2. Clone this repo 
  ```bash
  /> git clone -b Docker https://github.com/Micka33/coursestovacuum.git .
  ```
3. Create the VM
  ```
  vagrant up
  ```
4. Connect using SSH to the VM
  ```
  vagrant ssh
  ```
5. DONE! You can now use docker! (you will have to run docker commands using `sudo`)
