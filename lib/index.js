var control = require('control');
var _ = require('underscore');

module.exports = foo = {
  exec: function exec(commands, options){
    var stage = options.stage;
    var deploymentOptions = require("deploy/"+stage);
    _.each(command, function(command){
      foo[command].call(null, deploymentOptions);
    })
  },
  deploy: function deploy (options) {
    setup(options);
    checkout(options);
    changeSymlinks(options);
    restart(options);
  },
  setup: function stage (argument) {
    

  },
  checkout: function checkout (argument) {
    console.log("checkingout");
  },
  changeSymlinks: function checkout (argument) {
    console.log("switching symlinks");
  },
  restart: function checkout (argument) {
    console.log("switching symlinks");
  }
  
};




