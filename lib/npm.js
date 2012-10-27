console.log("Loading npm");

var npm = {
  restart: function restartNpm (cb) {
    this._serial([npm.stop, npm.start], cb);
  },
  start: function start (cb) {
    var self = this;
    this.hosts(function (host, done) {
      self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host), "npm install"], function() {
        self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host)+ " ; nohup npm start > logs/output.log 2>&1 &"], done);
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

module.exports = npm;