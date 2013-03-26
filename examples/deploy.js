module.exports = staging =   {
  hosts : [{host: "192.168.2.44", user: "v", location:"~/apps/nodetoolbox"}],
  repository: "git://github.com/sreeix/nodetoolbox2.git",
  branch: "master",
  deploymentType: "npm",
  defaultStage: 'staging'
  predeploy: function setupfolders (options) {
    this.logger.info("pre deploy");
  },
  postdeploy: function cleanup (options) {
    this.logger.info("Post deploy")
  }
};
