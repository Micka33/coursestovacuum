#!/bin/sh
gem install redis
gem install oj
gem install elasticsearch
npm install
cd node
npm install
cd ..
export LC_CTYPE=en_US.UTF-8
echo "Be sure to have your LC_TYPE env variable set. (export LC_CTYPE=en_US.UTF-8)\n"
echo "Now you will need to launch the followings : \n"
echo "Redis (redis-server)\n"
echo "the NodeJS server (cd node; npm start)\n"
echo "And finally\n"
echo "the PhantomJS script (npm start)\n"
