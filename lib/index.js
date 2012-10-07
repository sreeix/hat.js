var control = require('control');
var _ = require('underscore');
var async = require('async');
var path = require('path');
var fs = require('fs');

module.exports = app = {
  exec: function exec(commands, options, cb){
    var stage = options.stage;
    app.options = options;
    app.deploymentOptions = require(process.cwd() + "/deploy/" + stage);
      var deploymentTypePath = __dirname + path.sep + app.deploymentOptions.deploymentType
      if(fs.existsSync(deploymentTypePath+".js")) {_.extend(app, require(deploymentTypePath));}
      _exec(commands, cb);
  },

  deploy: function deploy (cb) {
    async.series(_mkserial(app.setup, app.checkout, app.changeSymlinks, app.restart), cb);
  },

  setup: function setup (cb) {
    _.each(app.deploymentOptions.hosts, function(host){
      app._ssh(host, ["mkdir -p " +  app.deploymentOptions.releasesPath(host),
                      "mkdir -p " +  app.deploymentOptions.sharedPath(host) + path.sep + "tmp",
                      "mkdir -p " +  app.deploymentOptions.sharedPath(host) + path.sep + "pids",
                      "mkdir -p " +  app.deploymentOptions.sharedPath(host) + path.sep + "logs" ], cb);
    });
  },

  checkout: function checkout ( cb) {
    _.each(app.deploymentOptions.hosts, function(host){
      var location = app.deploymentOptions.newReleasePath(host);
      app._ssh(host, ['mkdir -p '+  location,
                  'git clone '+ app.deploymentOptions.repository + ' ' + location,
                  'cd '+ location,
                  'git checkout '+ app.deploymentOptions.branch],
           cb);
    });
  },
// This is broken for multiple machines... as only one will be executed. Need to use async.parallel here and similar places.
  changeSymlinks: function changeSymlinks (cb) {
    _.each(app.deploymentOptions.hosts, function(host){
      app._ssh(host, [ "( [ -h " + app.deploymentOptions.currentPath(host) + " ] && unlink " + app.deploymentOptions.currentPath(host) + " || true )",
                   "ln -s "+ app.deploymentOptions.newReleasePath(host) + " "+ app.deploymentOptions.currentPath(host),
                   "mkdir -o "+ app.deploymentOptions.newReleasePath(host) + "/tmp",
                   "ln -s "+app.deploymentOptions.sharedPath(host)+ "/pids " + app.deploymentOptions.newReleasePath(host) + "tmp/pids",
                   "ln -s "+app.deploymentOptions.sharedPath(host)+ "/logs " + app.deploymentOptions.newReleasePath(host) + "tmp/logs",],
          cb);
    });
  },

  restart: function restart (cb) {
    cb(null, "restart")
  },

  rollback: function rollback (cb) {
    hosts(app.deploymentOptions.hosts, function(host){
      app._ssh(host, [ "ls "+ app.deploymentOptions.releasesPath(host)], cb);
    });
  },

  cleanup: function(cb){
    _.each(app.deploymentOptions.hosts, function(host){
      app._ssh(host, [ "cd "+ app.deploymentOptions.releasesPath(host), "count=`ls -t . | wc -l` && [ $count -gt 5 ] && (ls -t . | tail -n$(($count - 5)) | xargs rm -rf) || true" ], cb);
    });
  },

  hosts: function hosts (cb) {
    _.each(app.deploymentOptions.hosts, cb);
  },

  _serial: function _serial(funs, cb) {
    async.series(_mkserial(fns), cb);
  },
  
  _ssh: function _ssh (host, commands, cb){
    var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}});
    controller.ssh(_.flatten([commands], true).join(" && "), cb)
  }
};

var _mkserial= function(fns){
  return _.compact(_.collect(arguments, function(fn){
    if(_.isFunction(fn)){
      return function(done) {
        fn.call(app, function(res){ done(null, res)});
      }
    }
  }));
};

var _exec = function _exec(commands, cb){
  var currentTime= new Date().valueOf();
  app.deploymentOptions.newReleasePath = function(host){ return host.location + "/releases/" + currentTime};
  app.deploymentOptions.currentPath = function(host){ return host.location + "/current" };
  app.deploymentOptions.releasesPath = function(host){ return host.location + "/releases/"};
  app.deploymentOptions.sharedPath = function(host){ return host.location + "/shared/"};

  async.forEachSeries(_.flatten([commands]), _execCommand, function(err){
    if(_.isFunction(cb))
      cb(err, "_exec");
  });
};

var _execCommand = function _execCommand (command, callback) {
  return async.series(_mkserial(app.deploymentOptions["pre"+command], app[command], app.deploymentOptions["post"+command]), callback);
}
