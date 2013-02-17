var _ = require('underscore');

console.log("Loading npm");

var npm = {
  restart: function restartNpm (cb) {
    this._serial([npm.stop, npm.start], cb);
  },
  start: function start (cb) {
    var self = this;
    this.hosts(function (host, done) {
      self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host), "npm install"], function() {
        var outFile = self.deploymentOptions.deploymentType.outputFile || self.deploymentOptions.name + ".log" || "output.log";
        self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host)+ " ; "+ _env(self.deploymentOptions.deploymentType, "env") + " nohup npm start > logs/"+ outFile + " 2>&1 &"], done);
      });
    }, cb);
  },
  stop: function stop (cb) {
    var self = this;
    this.hosts(function (host, done) {
      self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host), "npm stop"], done);
    }, cb);
  }
};

var _env = function(obj, field) {
  return _.map(_.result(obj, field) || [], function( val, env) {
    return env + "=" + val;
  }).join(" ");
};

module.exports = npm;