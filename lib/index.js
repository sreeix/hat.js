var control = require('control');
var _ = require('underscore');
var async = require('async');

module.exports = foo = {
  exec: function exec(commands, options){
    var stage = options.stage;
    var deploymentOptions = require(process.cwd()+"/deploy/"+stage);
    _exec(commands, deploymentOptions);
  },

  deploy: function deploy (options) {
    async.series([_mkserial(foo.setup, options), _mkserial(foo.checkout, options), _mkserial(foo.changeSymlinks, options), _mkserial(foo.restart, options)]);
  },

  setup: function setup (opt, cb) {
    _.each(opt.hosts, function(host){
      _ssh(host, ["mkdir -p "+  host.location + "/releases", "mkdir -p "+  host.location + "/current"], cb);
    });
  },

  checkout: function checkout (opt, cb) {
    opt['time'] = new Date().valueOf();
    console.log("checkingout");
    _.each(opt.hosts, function(host){
      var location = host.location + "/releases/" + opt.time;
      _ssh(host, ["mkdir -p "+  location, 'git clone '+ opt.repository + " "+ location, 'cd '+ location + " && " + 'git checkout '+ opt.branch], cb);
    });
  },

  changeSymlinks: function changeSymlinks (opt, cb) {
    console.log("switching symlinks");
  },

  restart: function restart (opt, cb) {
    console.log("restarting application");
  }
};



var _mkserial= function(fn, opt){
  return function(done) {
    fn.call(this, opt, function(res){ console.log(res); done(null, res);});
  }
};

var _ssh = function _ssh (host, commands, cb){
  var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}});
  console.log(commands.join(" && "));
  controller.ssh(commands.join(" && "), cb)
};

var _exec = function _exec(commands, options){
  _.each(commands, function(command){
    if(_.isFunction(options["pre_"+command])){
      options["pre_"+command].call(null, options);
    }
    foo[command].call(foo, options);
    if(_.isFunction(options["post_"+command])){
      options["post_"+command].call(null, options);
    }
  });
};

