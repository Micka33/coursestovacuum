#!/bin/sh
cd /execs/ && npm install
exec node /execs/job_listener/listenForJobs.js
