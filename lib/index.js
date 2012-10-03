var control = require('control');
var _ = require('underscore');
var path = require('path');

module.exports = foo = {
  exec: function exec(commands, options){
    var stage = options.stage;
    var deploymentOptions = require(process.cwd()+"/deploy/"+stage);
    foo._exec(commands, deploymentOptions);
  },

  _exec: function _exec(commands, options){
    _.each(commands, function(command){
      if(_.isFunction(options["pre_"+command])){
        options["pre_"+command].call(null, options);
      }
      foo[command].call(foo, options);
      if(_.isFunction(options["post_"+command])){
        options["post_"+command].call(null, options);
      }
    });
  },
  _ssh: function ssh (host, commands){
    console.log(host);
    console.log(commands);
  },
  deploy: function deploy (options) {
    foo._exec(['setup', 'checkout', 'changeSymlinks', 'restart'], options)
  },
  setup: function setup (argument) {
    _.each(argument.hosts, function(host){
      foo._ssh(host, ["mkdir -p "+  host.location + "/releases", "mkdir -p "+  host.location + "/current"]);
    });
  },
  checkout: function checkout (argument) {
    argument['time'] = new Date().valueOf();
    console.log("checkingout");
    _.each(argument.hosts, function(host){
      var location = host.location + "/releases/"+argument.time;
      foo._ssh(host, ["mkdir -p "+  location, 'git clone '+ argument.repository + " "+ location, 'cd '+ location + " && " + 'git checkout '+ argument.branch]);
    });
  },
  changeSymlinks: function changeSymlinks (argument) {
    console.log("switching symlinks");
  },
  restart: function restart (argument) {
    console.log("restarting application");
  }
};




