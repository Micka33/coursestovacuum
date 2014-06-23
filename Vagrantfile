# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu/trusty64"

  # Multiple machines can be defined within the same project Vagrantfile
  # using the config.vm.define method call.
  config.vm.define "vdocker" do |sickrage|

    # If you'd like to try the latest version of Docker:
    # First, check that your APT system can deal with https URLs:
    # the file /usr/lib/apt/methods/https should exist.
    # If it doesn't, you need to install the package apt-transport-https.
    sickrage.vm.provision "shell",  inline: <<SH
      [ -e /usr/lib/apt/methods/https ] || {
        apt-get -y update
        apt-get -y install apt-transport-https
      }
SH

    # Then, add the Docker repository key to your local keychain.
    sickrage.vm.provision "shell",  inline: <<SH
      sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9
SH

    # Add the Docker repository to your apt sources list,
    # update and install the lxc-docker package.
    # You may receive a warning that the package isn't trusted.
    # Answer yes to continue installation.
    sickrage.vm.provision "shell",  inline: <<SH
      sh -c "echo deb https://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"
      apt-get -y update
      apt-get -y install lxc-docker
SH

    # It is easiest to install Git on Linux using the preferred
    # package manager of your Linux distribution.
    # Debian/Ubuntu
    # $ apt-get install git
    sickrage.vm.provision "shell",  inline: <<SH
      apt-get -y install git
SH

    # Automatically chdir to vagrant directory upon “vagrant ssh”
    sickrage.vm.provision "shell",  inline: <<SH
      echo "\n\ncd /home/vagrant/coursestovacuum\n" >> /home/vagrant/.bashrc
SH


    sickrage.vm.network "forwarded_port", guest: 80, host: 8082

    config.vm.synced_folder "docker", "/home/vagrant/coursestovacuum"

  end


end
