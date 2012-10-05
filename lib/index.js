var control = require('control');
var _ = require('underscore');
var async = require('async');

module.exports = foo = {
  exec: function exec(commands, options){
    var stage = options.stage;
    var deploymentOptions = require(process.cwd() + "/deploy/" + stage);
    _exec(commands, deploymentOptions);
  },

  deploy: function deploy (options, cb) {
    console.log("deploying");
    async.series([_mkserial(foo.setup, options),
                  _mkserial(foo.checkout, options),
                  _mkserial(foo.changeSymlinks, options),
                  _mkserial(foo.restart, options)], cb);
  },

  setup: function setup (opt, cb) {
    _.each(opt.hosts, function(host){
      _ssh(host, ["mkdir -p "+  opt.releasesPath(host)], cb);
    });
  },

  checkout: function checkout (opt, cb) {
    _.each(opt.hosts, function(host){
      var location = opt.newReleasePath(host);
      console.log("checking out " + location);
      _ssh(host, ['mkdir -p '+  location,
                  'git clone '+ opt.repository + ' ' + location,
                  'cd '+ location,
                  'git checkout '+ opt.branch],
           cb);
    });
  },

  changeSymlinks: function changeSymlinks (opt, cb) {
    _.each(opt.hosts, function(host){
      _ssh(host, [ "( [ -h " + opt.currentPath(host) + " ] && unlink " + opt.currentPath(host) + " || true )",
                   "ln -s "+ opt.newReleasePath(host) + " "+ opt.currentPath(host)],
          cb);
    });
  },

  restart: function restart (opt, cb) {
    console.log("restarting application");
    cb(null, "restart")
  },
  cleanup: function(opt, cb){
    console.log(""); cb(null, "cleaned up")
  }
};

var _mkserial= function(fn, opt){
  if(_.isFunction(fn)){
    return function(done) {
      fn.call(this, opt, function(res){ done(null, res);});
    }
  }
};

var _ssh = function _ssh (host, commands, cb){
  var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}});
  controller.ssh(commands.join(" && "), cb)
};

var _exec = function _exec(commands, options){
  var currentTime= new Date().valueOf();
  options.newReleasePath = function(host){ return host.location + "/releases/" + currentTime};
  options.currentPath = function(host){ return host.location + "/current" };
  options.releasesPath = function(host){ return host.location + "/releases/"};

  async.forEachSeries(_.flatten([commands]), function(command, cb){
    async.series(_.compact([_mkserial(options["pre"+command], options),
                            _mkserial(foo[command], options),
                            _mkserial(options["post"+command], options)]), cb);
  }, function(err){
    console.log("Finished");
  });
};

