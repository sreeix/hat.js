modules.export =  {
  name : "nodetoolbox",
  repo: "git@github.com:sreeix/nodetoolbox2.git",
  branch: "master",
  hosts : [{name: "ec2-50-16-23-51.compute-1.amazonaws.com", user: "ubuntu"}],
  location: "apps/nodetoolbox",
  pre-deploy : function setupfolders () {
    console.log("setting up forlders");
  },
  post-deploy: function cleanup () {
    console.log("Post deploy");
  }
};