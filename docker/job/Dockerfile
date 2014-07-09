FROM       phusion/baseimage
ENV        HOME /root
RUN        /etc/my_init.d/00_regen_ssh_host_keys.sh
CMD       ["/sbin/my_init"]


RUN        apt-get -y update
RUN        apt-get -y install libssl-dev
RUN        apt-get -y install libfreetype6
RUN        apt-get -y install fontconfig
RUN        apt-get -y install wget

RUN        mkdir install

# Installs NodeJS
WORKDIR    /install
RUN        (wget http://nodejs.org/dist/v0.10.29/node-v0.10.29-linux-x64.tar.gz) && (tar -xzf node-v0.10.29-linux-x64.tar.gz) && (rm node-v0.10.29-linux-x64.tar.gz)
WORKDIR    /install/node-v0.10.29-linux-x64
RUN        ln -s `pwd`/bin/node /usr/bin/node && ln -s `pwd`/bin/npm /usr/bin/npm

# Installs PhantomJS
WORKDIR    /install
RUN        wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2  && tar -xjf phantomjs-1.9.7-linux-x86_64.tar.bz2 && rm phantomjs-1.9.7-linux-x86_64.tar.bz2
WORKDIR    /install/phantomjs-1.9.7-linux-x86_64
RUN        ln -s `pwd`/bin/phantomjs /usr/bin/


RUN        echo "\n\nexport LC_CTYPE=en_US.UTF-8\n" >> /root/.bashrc

# Defines /root as the base directory when inspecting
WORKDIR    /root

ENTRYPOINT node /execs/job_listener/listenForJobs.js

# Cleans up APT when done.
RUN        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
