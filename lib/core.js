var control = require('ssh-control'),
    _ = require('underscore');

module.exports = {
  _local: function _local (host, commands, cb) {
    
  },
  _ssh: function _ssh (host, commands, cb){
    var command = _.flatten([commands], true).join(" && "), data = {stdout: "", stderr: ""};

    if(app.options.dryrun){
      console.log("Executing on "+host.host + " " + command);
      return cb(null, data);
    }
    var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}});
    if(!app.options.verbose){
      controller.logBuffer = function(prefix, buffer){ }
    }
    controller.stdout.on("data", function(res){
      data.stdout += res.toString();
    });
    controller.stderr.on("data", function(res){
      data.stderr += res.toString();
    });
    controller.ssh(command, function(){
      cb(null, data);
    });
  }
}