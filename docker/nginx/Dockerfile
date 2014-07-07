FROM       phusion/baseimage
ENV        HOME /root
RUN        /etc/my_init.d/00_regen_ssh_host_keys.sh
CMD       ["/sbin/my_init"]


RUN        apt-get -y update
RUN        apt-get -y install wget
RUN        apt-get -y install unzip
RUN        apt-get -y install libxml2 libxml2-dev libgd2-xpm-dev libgeoip-dev libperl-dev libxslt1-dev libxslt1.1
RUN        apt-get -y install libssl-dev
RUN        apt-get -y install make
RUN        apt-get -y install g++

# Gets PCRE
WORKDIR    /install
RUN        (wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.35.tar.gz) && (tar -xzf pcre-8.35.tar.gz) && (rm pcre-8.35.tar.gz)
# Gets Nginx Developer Kit
WORKDIR    /install
RUN        (wget https://github.com/simpl/ngx_devel_kit/archive/v0.2.19.zip) && (unzip v0.2.19.zip) && (rm v0.2.19.zip)
# Gets Zlib
WORKDIR    /install
RUN        (wget http://zlib.net/zlib-1.2.8.tar.gz) && (tar -xzf zlib-1.2.8.tar.gz) && (rm zlib-1.2.8.tar.gz)

# Installs Nginx
WORKDIR    /install
RUN        (wget http://nginx.org/download/nginx-1.6.0.tar.gz) && (tar -xzf nginx-1.6.0.tar.gz) && (rm nginx-1.6.0.tar.gz)
WORKDIR    /install/nginx-1.6.0
RUN        mkdir -p /var/lib/nginx/body
RUN        ./configure \
              --prefix=/usr/share/nginx  \
              --conf-path=/etc/nginx/nginx.conf  \
              --error-log-path=/var/log/nginx/error.log  \
              --http-client-body-temp-path=/var/lib/nginx/body  \
              --http-fastcgi-temp-path=/var/lib/nginx/fastcgi  \
              --http-log-path=/var/log/nginx/access.log  \
              --http-proxy-temp-path=/var/lib/nginx/proxy  \
              --http-scgi-temp-path=/var/lib/nginx/scgi  \
              --http-uwsgi-temp-path=/var/lib/nginx/uwsgi  \
              --lock-path=/var/lock/nginx.lock  \
              --pid-path=/run/nginx.pid  \
              --with-pcre-jit  \
              --with-debug  \
              --with-http_addition_module  \
              --with-http_dav_module  \
              --with-http_flv_module  \
              --with-http_geoip_module  \
              --with-http_gzip_static_module  \
              --with-http_image_filter_module  \
              --with-http_mp4_module  \
              --with-http_perl_module  \
              --with-http_random_index_module  \
              --with-http_realip_module  \
              --with-http_secure_link_module  \
              --with-http_stub_status_module  \
              --with-http_ssl_module  \
              --with-http_sub_module  \
              --with-http_xslt_module  \
              --with-ipv6  \
              --with-sha1=/usr/include/openssl  \
              --with-md5=/usr/include/openssl  \
              --with-mail  \
              --with-mail_ssl_module  \
              --with-http_spdy_module  \
              --with-pcre=`pwd`/../pcre-8.35  \
              --with-zlib=`pwd`/../zlib-1.2.8  \
              --add-module=`pwd`/../ngx_devel_kit-0.2.19
RUN         make
RUN         sudo make install
RUN         ln -s `pwd`/objs/nginx  /bin/nginx

# Creates nginx Service
RUN        mkdir -p /etc/service/nginx
RUN        echo "#!/bin/sh -e\nchmod +x /datas/config/nginx.sh\nln -s /datas/config/nginx.sh /etc/service/nginx/run\n" > /etc/rc.local

# Defines /root as the base directory when inspecting
WORKDIR    /root

# Cleans up APT when done.
RUN        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
