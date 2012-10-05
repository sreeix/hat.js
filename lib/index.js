var control = require('control');
var _ = require('underscore');
var async = require('async');
var path = require('path')
var fs = require('fs')

module.exports = app = {
  exec: function exec(commands, options){
    var stage = options.stage;
    this.deploymentOptions = require(process.cwd() + "/deploy/" + stage);
      var deploymentTypePath = __dirname + path.sep + app.deploymentOptions.deploymentType
      if(fs.existsSync(deploymentTypePath)) _.extend(app, require(deploymentTypePath));
      _exec(commands, app.deploymentOptions);
  },

  deploy: function deploy (cb) {
    console.log("deploying");
    async.series([_mkserial(app.setup),
                  _mkserial(app.checkout),
                  _mkserial(app.changeSymlinks),
                  _mkserial(app.restart)],
                cb);
  },

  setup: function setup (cb) {
    _.each(app.deploymentOptions.hosts, function(host){
      _ssh(host, ["mkdir -p "+  app.deploymentOptions.releasesPath(host)], cb);
    });
  },

  checkout: function checkout ( cb) {
    _.each(app.deploymentOptions.hosts, function(host){
      var location = app.deploymentOptions.newReleasePath(host);
      console.log("checking out " + location);
      _ssh(host, ['mkdir -p '+  location,
                  'git clone '+ app.deploymentOptions.repository + ' ' + location,
                  'cd '+ location,
                  'git checkout '+ app.deploymentOptions.branch],
           cb);
    });
  },
// This is broken for multiple machines... as only one will be executed. Need to use async.parallel here and similar places.
  changeSymlinks: function changeSymlinks (cb) {
    _.each(app.deploymentOptions.hosts, function(host){
      _ssh(host, [ "( [ -h " + app.deploymentOptions.currentPath(host) + " ] && unlink " + app.deploymentOptions.currentPath(host) + " || true )",
                   "ln -s "+ app.deploymentOptions.newReleasePath(host) + " "+ app.deploymentOptions.currentPath(host)],
          cb);
    });
  },

  restart: function restart (cb) {
    console.log("restarting application");
    cb(null, "restart")
  },
  cleanup: function(cb){
    _.each(app.deploymentOptions.hosts, function(host){
      _ssh(host, [ "cd "+ app.deploymentOptions.releasesPath(host), "count=`ls -t . | wc -l` && [ $count -gt 5 ] && ls -t . | head -n$(($count - 5)) | xargs rm -rf"], cb);
    });
  }
};

var _mkserial= function(fn){
  if(_.isFunction(fn)){
    return function(done) {
      fn.call(app, function(res){ done(null, res);});
    }
  }
};

var _ssh = function _ssh (host, commands, cb){
  var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}});
  controller.ssh(commands.join(" && "), cb)
};
var _serial = function _serial (funs, cb) {
  async.series(_.collect(funs, function(fn){
    return _mkserial(fn)
  }))
}
var _exec = function _exec(commands){
  var currentTime= new Date().valueOf()
  app.deploymentOptions.newReleasePath = function(host){ return host.location + "/releases/" + currentTime};
  app.deploymentOptions.currentPath = function(host){ return host.location + "/current" };
  app.deploymentOptions.releasesPath = function(host){ return host.location + "/releases/"};

  async.forEachSeries(_.flatten([commands]), function(command, cb){
    async.series(_.compact([_mkserial(app.deploymentOptions["pre"+command]),
                            _mkserial(app[command]),
                            _mkserial(app.deploymentOptions["post"+command])]), cb);
  }, function(err){
    console.log("Finished");
  });
};

