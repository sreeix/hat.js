var control = require('ssh-control'),
    _ = require('underscore'),
    childProcess = require('child_process');

module.exports = {
  _local: function _local (commands, cb){
    var self= this, command = _.flatten([commands], true).join(" && "),
        data = {stdout: "", stderr: ""};

    if(this.options.dryrun){
      console.log("Executing locally " + " " + command);
      return cb(null, data);
    }
    console.log("Executing locally: "+ command)
    childProcess.exec(command, function(err, stdout, stderr){
      if(self.options.verbose){
        console.log("stderr:"+stderr);
        console.log("stdout:"+stdout);
      }
      return cb(err, {stderr: stderr, stdout: stdout});
    });
  },

  _ssh: function _ssh (host, commands, cb){
    var command = _.flatten([commands], true).join(" && ");
    remoteController.apply(this, [host, this.options]).ssh(command, cb)
  },
  _scp: function _ssh (host, src, destination, cb){
    remoteController.apply(this, [host, this.options]).scp(src, destination, cb)
  }
};

var remoteController =  function(host, options) {
  var data = {stdout: "", stderr: ""};
  if(options.dryrun){
    console.log("Executing on "+host.host);
    return cb(null, data);
  }
  var controller = Object.create(control.controller, {address: {value:host.host}, user:{value: host.user}});
  if(!options.verbose){
    controller.logBuffer = function(prefix, buffer){ }
  }
  controller.stdout.on("data", function(res){
    data.stdout += res.toString();
  });
  controller.stderr.on("data", function(res){
    data.stderr += res.toString();
  });
  return {
    ssh: function ssh (command, cb) {
      return controller.ssh(command, function() {cb(null, data)});
    },
    scp: function scp (src, dest, cb) {
      return controller.scp(src,dest, function() {cb(null, data)})
    }
  };
};