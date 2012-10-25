var childProcess = require('child_process');

var compress = function(cb) {
  var name = this.deploymentOptions.name, destination = '/tmp/'+name;
  return this._local(["cd "+ destination, "zip -r " + destination + " ."], cb);
}

var copyToRemote = function(cb) {
  var self = this;
  this.hosts(function(host, done) {
    var src = '/tmp/'+this.deploymentOptions.name+".zip";
    self._scp(host, src, "/tmp/", done);
  }, cb);
}
var decompressRemote = function decompressRemote(cb) {
  var self = this;
  this.hosts(function(host, done) {
    var location = this.deploymentOptions.newReleasePath(host),
        src = '/tmp/'+this.deploymentOptions.name+".zip";
    self._ssh(host, ['unzip '+ src + ' -d '+ location], done);
  }, cb);
}

module.exports = {
  deploy: function deployCopy(cb) {
    this._serial([this.checkoutLocal, compress, copyToRemote, decompressRemote, this.changeSymlinks, this.restart], cb);
  }
};
