FROM       phusion/baseimage
ENV        HOME /root
RUN        /etc/my_init.d/00_regen_ssh_host_keys.sh
CMD       ["/sbin/my_init"]


RUN        apt-get -y update
RUN        apt-get -y install g++
RUN        apt-get -y install make
RUN        apt-get -y install wget


# Installs Redis
WORKDIR    /install
RUN        wget http://download.redis.io/releases/redis-2.8.11.tar.gz && tar -xzf redis-2.8.11.tar.gz && rm redis-2.8.11.tar.gz
WORKDIR    /install/redis-2.8.11
RUN        apt-get -y install tk8.5 tcl8.5
RUN        make #&& make test #make test fail on memory test
RUN        ln -s `pwd`/src/redis-benchmark /usr/bin/ && ln -s `pwd`/src/redis-check-aof /usr/bin/ && ln -s `pwd`/src/redis-check-dump /usr/bin/ && ln -s `pwd`/src/redis-cli /usr/bin/ && ln -s `pwd`/src/redis-sentinel /usr/bin/ && ln -s `pwd`/src/redis-server /usr/bin/

# Creates Redis Service
RUN        mkdir /etc/service/redis
RUN        mkdir -p /etc/my_init.d
RUN        echo "chmod +x /datas/config/redis.sh\nln -s /datas/config/redis.sh /etc/service/redis/run\nln -s /datas/config/redis.conf /etc/service/redis/redis.conf\n" > /etc/my_init.d/linking.sh

# Defines /root as the base directory when inspecting
WORKDIR    /root

EXPOSE     6379

# Cleans up APT when done.
RUN        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
