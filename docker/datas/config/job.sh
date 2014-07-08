#!/bin/sh
cd /execs/ && npm install
cd /execs/node && npm install
exec node /execs/job_listener/listenForJobs.js
