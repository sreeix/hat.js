Hat.js [![Build Status](https://secure.travis-ci.org/sreeix/hat.js.png?branch=master)](http://travis-ci.org/sreeix/hat.js)
========

Deployment for Node js. It simplifies the deployment to production servers.
The Javascript Hat for the Ruby's Cap.


What does it do?
================

It uses ssh to allow execution of simple shell scripts on remote servers when deploying your node.js process.

The framework is extremely simple and reads from a deploy folder in the root of your application. You can add multiple files there each file becomes a stage. eg. staging.js for staging environment and production.js for production environment.



There is no DSL or language to describe your deployment. The frameworks consists of a simple JS deployment information file like in the [example folder](https://github.com/sreeix/hat.js/blob/master/examples/deploy.js).

Usage
======

* Include hat.js in your package.json.
* npm install
* Create a deploy folder in the root of the app.
* Add the appropriate stage configuration files( or generate it via `hat.js --generate staging`)
* `hat.js -s staging deploy`

* `hat.js --help` : Prints all the options available
* `hat.js --tasks` : Prints all the available tasks and some basic description.
* `hat.js --generate staging` : Generates a simple but working deploy script for staging environment


The standard format is hat.js <options> -s <stage> <function>
All tasks generate an output.html for tracking execution times. It looks something like this

![Output File!](http://github.com/sreeix/hat.js/raw/master/images/deploygraph.png)



  `asshat.js <options> <stage> `
This command will just rollback a release.

Standard Tasks
--------------------

Following are provided by default.

  * _setup_ : sets up the basic deployment environment. This should be done before complete deploy
  * _cleanup_ : cleans up old releases from the hosts. Defaults to keep only 5 releases
  * _deploy_ : Deploys the code to production. Changes Symlink and restarts application
  * _rollback_ : Rolls back a deployment. By default only goes back 1 revision.

In the wild
===========
The [Node Toolbox](http://nodetoolbox.com) uses hat.js to deploy, and the scripts are checked in [here](https://github.com/sreeix/nodetoolbox2/tree/master/deploy).

Also check out the scripts section of Nodetoolbox's [package.json](https://github.com/sreeix/nodetoolbox2/blob/master/package.json) for deployment via commandline options.

Configuration
=============

A simple exported javascript file is used for configuration. Look at [deploy.js](https://github.com/sreeix/hat.js/blob/master/examples/deploy.js)
or use the --generate option to create a new one.

Here are the details on the [Config Options](https://github.com/sreeix/hat.js/wiki/Configuration)

Deployment Steps
==================
On running deploy following happens

* **setup** Setup of the folders. The deployment structure follows cap structure of
  * current (This is where the app will be running from)
  * releases (All the releases deployed to the machine. current folder points to one of the release folders)
  * shared (All the stuff common between releases. Stuff like pids/logs/caches/sockets)
* **checkout** Git clone the appropriate branch to the releases folder.
* **changeSymlinks** Symlinks to current are switched to the new release.
* **restart** App is restarted.If using npm module, npm stop; npm install; npm start is invoked in sequence.


Extending the deploy scripting
==============================

All tasks have a pre/post script. eg. if a *predeploy* function exists in the deployscript then it will be executed before the execution of deploy task. Similarly if *postdeploy* function exists  then it will be invoked after deploy step is successful.


By implementing the default functions (restart/deploy/cleanup/changeSymlinks) you could do your own thing and not rely on any of the internal things. This is being done in [npm.js](https://github.com/sreeix/hat.js/blob/master/lib/npm.js).

The plugins are called in the context of the main app so most internal methods are available for plugins to call eg.

* _ssh : Executes command(s) on a host
* hosts : function to execute stuff on each machine.
* _serial: execute bunch of methods serially.


Limitations
============

* Currently only supported repository type is **git**
* Currently only supported deployment type is npm.
* Half assed api for plugin Authors. I am actively looking to improve this.
* Lots of missing options (like set deploy optimization for checkouts/ deploying via scp on remote macines)

