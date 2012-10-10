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
    app.hosts(function(host, done){
      app._ssh(host, ["mkdir -p " +  app.deploymentOptions.releasesPath(host),
                      "mkdir -p " +  app.deploymentOptions.sharedPath(host) + path.sep + "tmp",
                      "mkdir -p " +  app.deploymentOptions.sharedPath(host) + path.sep + "pids",
                      "mkdir -p " +  app.deploymentOptions.sharedPath(host) + path.sep + "logs" ],
               done);
    }, cb);
  },

  checkout: function checkout ( cb) {
    app.hosts(function(host, callback){
      var location = app.deploymentOptions.newReleasePath(host);
      app._ssh(host, ['mkdir -p '+  location,
                  'git clone '+ app.deploymentOptions.repository + ' ' + location,
                  'cd '+ location,
                  'git checkout '+ app.deploymentOptions.branch],
              callback);
    }, cb);
  },

  changeSymlinks: function changeSymlinks (cb) {
    app.hosts(function(host, done){
      app._ssh(host, [ "( [ -h " + app.deploymentOptions.currentPath(host) + " ] && unlink " + app.deploymentOptions.currentPath(host) + " || true )",
                   "ln -s "+ app.deploymentOptions.newReleasePath(host) + " "+ app.deploymentOptions.currentPath(host),
                   "mkdir -p "+ app.deploymentOptions.newReleasePath(host) + "tmp",
                   "mkdir -p "+ app.deploymentOptions.newReleasePath(host) + "logs",
                   "ln -s "+app.deploymentOptions.sharedPath(host)+ "pids " + app.deploymentOptions.newReleasePath(host) + "tmp/pids",
                   "ln -s "+app.deploymentOptions.sharedPath(host)+ "logs " + app.deploymentOptions.newReleasePath(host) + "tmp/logs"],
          done);
    }, cb);
  },

  restart: function restart (cb) {
    cb(new Error("Implement your own thing. Maybe you've forgotten to set the correct deployment type"));
  },

  rollback: function rollback (cb) {
    app.hosts(function(host, done){
      var releases = function releases (callback) {
        app._ssh(host, "ls -t "+ app.deploymentOptions.releasesPath(host), callback);
      };
      var rollbackToSelected = function rollbackToSelected (releases, callback) {
        var allReleases = releases.stdout.split("\n");

        app._ssh(host, "readlink "+ app.deploymentOptions.currentPath(host), function unLinkAndRelink (err, data) {
          var current = path.basename(data.stdout.split("\n")[0]).replace("/", ""),
              newIndex = _.indexOf(allReleases, current) + (app.options.revisions || 1);
          if(allReleases.length > newIndex){
            app._ssh(host, ["unlink "+ app.deploymentOptions.currentPath(host),
                            "ln -s "+ app.deploymentOptions.releasesPath(host, allReleases[newIndex]) + " " +app.deploymentOptions.currentPath(host)],
                     callback);
          } else {
            callback(new Error("Not enough releases to go back."));
          }
        });
      }
      async.waterfall([releases, rollbackToSelected], done);
    }, cb);
  },

  cleanup: function(cb){
    app.hosts(function(host, done){
      app._ssh(host, [ "cd "+ app.deploymentOptions.releasesPath(host), "count=`ls -t . | wc -l` && [ $count -gt 5 ] && (ls -t . | tail -n$(($count - 5)) | xargs rm -rf) || true" ], done);
    }, cb);
  },

  hosts: function hosts (fn, cb) {
    return async.parallel(_.collect(app.deploymentOptions.hosts, function(host, done){ return _.bind(fn, app, host)}), cb)
  },

  _serial: function _serial(funs, cb) {
    console.log(funs);
    async.series(_mkserial(funs), cb);
  },
  
  _ssh: function _ssh (host, commands, cb){
    var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}}),
        data = {stdout: "", stderr: ""};
    controller.stdout.on("data", function(res){
      data.stdout += res.toString();
    });
    controller.stderr.on("data", function(res){
      data.stderr += res.toString();
    });
    controller.ssh(_.flatten([commands], true).join(" && "), function(){
      cb(null, data);
    });
  }
};

var _mkserial= function(fns){
  return _.compact(_.collect(_.flatten(arguments), function(fn){
    if(_.isFunction(fn)){
      return function(done) {
        fn.call(app, function(res){ done(null, res)});
      }
    }
  }));
};

var _exec = function _exec(commands, cb){
  var currentTime= new Date().valueOf();
  app.deploymentOptions.newReleasePath = function(host){ return host.location + "/releases/" + currentTime+"/"};
  app.deploymentOptions.currentPath = function(host){ return host.location + "/current" };
  app.deploymentOptions.releasesPath = function(host, release){
    return (_.isUndefined(release) || _.isNull(release)) ? host.location + "/releases/" :  host.location + "/releases/"+ release +"/";
  };
  app.deploymentOptions.sharedPath = function(host){ return host.location + "/shared/"};

  async.forEachSeries(_.flatten([commands]), _execCommand, function(err){
    if(_.isFunction(cb))
      cb(err, "_exec");
  });
};

var _execCommand = function _execCommand (command, callback) {
  return async.series(_mkserial(app.deploymentOptions["pre"+command], app[command], app.deploymentOptions["post"+command]), callback);
}
