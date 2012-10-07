Hat.js
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
* Create a deploy folder in the root of the app.
* Add the appropriate stage configuration files
* `hat.js staging deploy`

The standard format is hat.js <options> <stage> <function>

  `asshat.js <options> <stage> `
This will just rollback a release. 

Standard Functions
--------------------
  
Following are provided by default.
  
  * setup : sets up the basic deployment environment. This should be done before complete deploy
  * cleanup: cleans up old releases from the hosts. Defaults to keep only 5 releases
  * deploy Deploys the code to production. Changes Symlink and restarts application
  * rollback : Rolls back a deployment. By default only goes back 1 revision.

Deployment Steps
==================
On running deploy following happens

* Setup of the folders. The deployment structure follows cap structure of 
  ** current (This is where the app will be running from)
  ** releases (All the releases deployed to the machine. current folder points to one of the release folders)
  ** shared (All the stuff common between releases. Stuff like pids/logs/caches/sockets)
* Git clone the appropriate branch to the releases folder.
* Symlinks to current are switched to the new release.
* App is restarted. This is a dummy task. If using npm module, npm stop; npm install; npm start is invoked in sequence.
   
  

Extending the deploy scripting
==============================

All tasks have a pre/post script. eg. if a *predeploy* function exists in the deployscript then it will be executed before the execution of deploy task. Similarly if *postdeploy* function exists  then it will be invoked after deploy step is successful.


By implementing the default functions (restart/deploy/cleanup/changeSymlinks) you could do your own thing and not rely on any of the internal things. This is being done in [npm.js](https://github.com/sreeix/hat.js/blob/master/lib/npm.js)
