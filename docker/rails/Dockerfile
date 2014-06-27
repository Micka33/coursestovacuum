FROM       phusion/baseimage
ENV        HOME /root
RUN        /etc/my_init.d/00_regen_ssh_host_keys.sh
CMD       ["/sbin/my_init"]


RUN        apt-get -y update
RUN        apt-get -y install libssl-dev
RUN        apt-get -y install build-essential libpq-dev libruby2.0 ruby2.0 ruby2.0-dev ruby1.9.1-dev
RUN        apt-get -y install git
RUN        apt-get -y install wget
RUN        apt-get -y install gcc g++ 
RUN        apt-get -y install libreadline-dev libssl-dev zlib1g-dev build-essential bison openssl libreadline6 libreadline6-dev zlib1g zlib1g-dev libssl-dev libyaml-dev libxml2-dev libxslt-dev autoconf libc6-dev ncurses-dev
RUN        gem install bundler

# Installs NodeJS
WORKDIR    /install
RUN        (wget http://nodejs.org/dist/v0.10.29/node-v0.10.29-linux-x64.tar.gz) && (tar -xzf node-v0.10.29-linux-x64.tar.gz) && (rm node-v0.10.29-linux-x64.tar.gz)
WORKDIR    /install/node-v0.10.29-linux-x64
RUN        ln -s `pwd`/bin/node /usr/bin/node && ln -s `pwd`/bin/npm /usr/bin/npm


# Creates railsserver Service
RUN        mkdir -p /etc/service/rails
RUN        echo "#!/bin/sh -e\nchmod +x /datas/config/rails_server.sh\nln -s /datas/config/rails_server.sh /etc/service/rails/run\n" > /etc/rc.local
# RUN        echo "#!/bin/sh -e\ncd /datas/node/; npm install;\n" >> /etc/rc.local

# Defines /root as the base directory when inspecting
WORKDIR    /root

# Cleans up APT when done.
RUN        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
