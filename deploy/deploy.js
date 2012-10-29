var  =   {
  name: "hat.js",
  hosts : [{host: "host", user: "user", location:"~/apps/hat.js"}],
  repository: { type: "git", url: "giturl", branch: "master"},
  deploymentType: "npm",
  predeploy: function setupfolders (done) {
    console.log("pre deploy");
    done();
  },
  postdeploy: function cleanup (done) {
    console.log("Post deploy")
    this.cleanup(done);
  }
};
module.exports = ;