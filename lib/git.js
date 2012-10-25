var commands = function(location, repository) {
  return ['mkdir -p '+  location,
          'git clone '+ repository.url + ' ' + location,
          'cd '+ location,
          'git checkout '+ repository.branch || 'master'];
};

var git = {
  checkout: function(cb){
    var self = this;
    this.hosts(function(host, done){
      var location = self.deploymentOptions.newReleasePath(host);
      self._ssh(host, commands(location, self.deploymentOptions.repository), done);
    }, cb);
  },
  checkoutLocal: function checkoutLocal (cb) {
    return this._local(commands("/tmp/"+ this.deploymentOptions.name, this.deploymentOptions.repository), cb);
  }
};

module.exports = git;