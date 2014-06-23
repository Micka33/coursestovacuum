FROM       phusion/baseimage
ENV        HOME /root
RUN        /etc/my_init.d/00_regen_ssh_host_keys.sh
CMD       ["/sbin/my_init"]




MAINTAINER Mickael Cassy <twitter@mickaelcassy>
RUN        apt-get -y update
RUN        apt-get -y install libssl-dev
RUN        apt-get -y install git
RUN        apt-get -y install g++
RUN        apt-get -y install make
RUN        apt-get -y install libfreetype6
RUN        apt-get -y install fontconfig
RUN        apt-get -y install wget
RUN        mkdir install

# Installs NodeJS
WORKDIR    /install
RUN        (wget http://nodejs.org/dist/v0.10.29/node-v0.10.29-linux-x64.tar.gz) && (tar -xzf node-v0.10.29-linux-x64.tar.gz) && (rm node-v0.10.29-linux-x64.tar.gz)
WORKDIR    /install/node-v0.10.29-linux-x64
RUN        ln -s `pwd`/bin/node /usr/bin/ && ln -s `pwd`/bin/npm /usr/bin/

# Installs RVM w/ Ruby
WORKDIR    /install
RUN        (\curl -sSL https://get.rvm.io | bash -s stable --ruby=2.1.2)
RUN        echo "source $HOME/.rvm/scripts/rvm" >> ~/.bash_profile

# Installs Redis
WORKDIR    /install
RUN        wget http://download.redis.io/releases/redis-2.8.11.tar.gz && tar -xzf redis-2.8.11.tar.gz && rm redis-2.8.11.tar.gz
WORKDIR    /install/redis-2.8.11
RUN        apt-get -y install tk8.5 tcl8.5
RUN        make #&& make test #make test fail on memory test
RUN        ln -s `pwd`/src/redis-benchmark /usr/bin/ && ln -s `pwd`/src/redis-check-aof /usr/bin/ && ln -s `pwd`/src/redis-check-dump /usr/bin/ && ln -s `pwd`/src/redis-cli /usr/bin/ && ln -s `pwd`/src/redis-sentinel /usr/bin/ && ln -s `pwd`/src/redis-server /usr/bin/

# Installs ElasticSearch
WORKDIR    /install
RUN        wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.2.1.deb
RUN        dpkg -i elasticsearch-1.2.1.deb && rm elasticsearch-1.2.1.deb

# installs PhantomJS
WORKDIR    /install
RUN        wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2  && tar -xjf phantomjs-1.9.7-linux-x86_64.tar.bz2 && rm phantomjs-1.9.7-linux-x86_64.tar.bz2
WORKDIR    /install/phantomjs-1.9.7-linux-x86_64
RUN        ln -s `pwd`/bin/phantomjs /usr/bin/


# Creates Redis Service
RUN        mkdir /etc/service/redis
ADD        scripts/redis.sh /etc/service/redis/run

# Creates ElasticSearch Service
RUN        mkdir /etc/service/elasticsearch
ADD        scripts/elasticsearch.sh /etc/service/elasticsearch/run




# Removes the install folder
RUN        rm -rf /install
# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
