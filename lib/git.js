module.exports = git = {
  checkout: function(cb){
    var self = this;
    this.hosts(function(host, done){
      var location = app.deploymentOptions.newReleasePath(host);
      self._ssh(host, ['mkdir -p '+  location,
                  'git clone '+ self.deploymentOptions.repository.location + ' ' + location,
                  'cd '+ location,
                  'git checkout '+ self.deploymentOptions.repository.branch || 'master'],
              done);
    }, cb)
  }
}