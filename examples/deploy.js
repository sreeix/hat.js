module.exports = staging =   {
  hosts : [{host: "192.168.2.44", user: "v", location:"~/apps/nodetoolbox"}],
  repository: "git://github.com/sreeix/nodetoolbox2.git",
  branch: "master",
  deploymentType: "npm",
  pre_deploy: function setupfolders (options) {
    console.log("pre deploy");
  },
  post_deploy: function cleanup (options) {
    console.log("Post deploy")
  }
};
