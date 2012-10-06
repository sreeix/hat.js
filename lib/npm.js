console.log("Loading npm");

module.exports = npm = {
  restart: function restartNpm (cb) {
    this._serial([npm.stop, npm.start], cb)
  },
  start: function start (cb) {
    var self = this;
    this.hosts(function (host) {
      self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host), "npm install", "npm start"], cb);
    })
  },
  stop: function stop (cb) {
    var self = this;
    this.hosts(function (host) {
      self._ssh(host, ["cd "+ self.deploymentOptions.currentPath(host), "npm stop"], cb);
    })
  }
};