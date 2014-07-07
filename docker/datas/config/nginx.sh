#!/bin/sh
cp /datas/config/nginx.conf /etc/nginx/nginx.conf
sed -i "s/upstream_to_replace/server $RAILSSERVER_1_PORT_80_TCP_ADDR:$RAILSSERVER_1_PORT_80_TCP_PORT;/g" /etc/nginx/nginx.conf
exec nginx
