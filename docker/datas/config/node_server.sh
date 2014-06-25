#!/bin/sh
cd /execs/node ; npm install
exec node /execs/node/server.js
