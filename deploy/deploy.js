var  =   {
  name: "hat.js",
  hosts : [{host: "host", user: "user", location:"~/apps/hat.js"}],
  repository: { type: "git", url: "giturl", branch: "master"},
  deploymentType: "npm",
  predeploy: function setupfolders (done) {
    this.logger.info("pre deploy");
    done();
  },
  postdeploy: function cleanup (done) {
    this.logger.info("Post deploy")
    this.cleanup(done);
  }
};
module.exports = ;