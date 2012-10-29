var staging =   {
  name: "hat.js",
  hosts : [{host: "host", user: "user", location:"~/apps/hat.js"}],
  via: "copy"
  repository: { type: "git", url: "giturl", branch: "master"},
  deploymentType: {"type": "npm", logFile:"hat.js.log", env: {NODE_ENV: "development", PIDFILE: "tmp/pids/hat.js.pid"}},
  predeploy: function setupfolders (done) {
    console.log("pre deploy");
    done();
  },
  postdeploy: function cleanup (done) {
    console.log("Post deploy")
    this.cleanup(done);
  }
};
module.exports = staging;