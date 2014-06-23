#!/bin/sh
cd node
screen -dmS node_server npm start > ../log/node_server.log
cd ../job_listener
screen -dmS job_listener node listenForJobs.js > ../log/job_listener.log
cd ..
npm start