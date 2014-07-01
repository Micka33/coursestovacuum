#!/usr/bin/env puma
# -*- coding: utf-8 -*-

## These, are custom vars
##
application_path = (File.expand_path File.dirname(__FILE__)) + '/..'
railsenv = "development"

## The directory to operate out of.
##
## The default is the current directory.
##
directory application_path

## Set the environment in which the rack's app will run. The value must be a string.
##
## The default is “development”.
##
environment railsenv

# -*- coding: utf-8 -*-
## Configure “min” to be the minimum number of threads to use to answer
## requests and “max” the maximum.
##
## The default is “0, 16”.
##
threads 1,16

## How many worker processes to run.
##
## The default is “0”.
##
workers 0

## If you're running in Clustered Mode you can optionally choose to preload your application
## before starting up the workers.
##
## This is necessary in order to take advantate of the Copy on Write feature introduced in MRI Ruby 2.0.
##
preload_app!


## This code can be used to setup the process before booting the application,
## allowing you to do some Puma-specific things that you don't want to embed in your application.
##
## For instance, you could fire a log notification that a worker booted or send something to statsd.
##
## This can be called multiple times to add hooks.
##
## If you're preloading your application and using ActiveRecord,
## it's recommend you setup your connection pool here:
##
## # config/puma.rb
## on_worker_boot do
##   ActiveSupport.on_load(:active_record) do
##     ActiveRecord::Base.establish_connection
##   end
## end
on_worker_boot do
  # configuration here
end

## Puma isn't able to understand all the resources that your app may use,
## so it provides a hook in the configuration file you pass to -C called on_restart.
##
## The block passed to on_restart will be called, unsurprisingly, just before Puma restarts itself.
##
## You should place code to close global log files, redis connections,
## etc in this block so that their file descriptors don't leak into the restarted process.
##
## Failure to do so will result in slowly running out of descriptors
## and eventually obscure crashes as the server is restart many times.
##
## This can be called multiple times to add code each time.
on_restart do
  # Todo
end

## Daemonize the server into the background. Highly suggest that
## this be combined with “pidfile” and “stdout_redirect”.
##
## The default is “false”.
##
## daemonize
## daemonize false
##
daemonize false

## Store the pid of the server in the file at “path”.
##
# pidfile "#{application_path}/tmp/pids/puma_#{railsenv}.pid"

## Use “path” as the file to store the server info state. This is
## used by “pumactl” to query and control the server.
##
state_path "#{application_path}/tmp/pids/puma_#{railsenv}.state"

## Redirect STDOUT and STDERR to files specified. The 3rd parameter
## (“append”) specifies whether the output is appended, the default is
## “false”.
##
stdout_redirect "#{application_path}/log/puma_#{railsenv}_stdout", "#{application_path}/log/puma_#{railsenv}_stderr", true



## Bind the server to “url”. “tcp://”, “unix://” and “ssl://” are the only
## accepted protocols.
##
## The default is “tcp://0.0.0.0:9292”.
##
## bind "tcp://0.0.0.0:9292"
## bind "unix:///var/run/puma.sock"
## bind "unix:///var/run/puma.sock?umask=0777"
## bind "ssl://127.0.0.1:9292?key=path_to_key&cert=path_to_cert"
##
# bind "tcp://127.0.0.1:3000"
# bind "unix:///#{application_path}/tmp/sockets/#{railsenv}.sock"
bind "tcp://0.0.0.0:8282"


## Instead of “bind 'ssl://127.0.0.1:9292?key=path_to_key&cert=path_to_cert'” you
## can also use the “ssl_bind” option.
##
## ssl_bind '127.0.0.1', '9292', { key: path_to_key, cert: path_to_cert }
