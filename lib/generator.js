var _ = require("underscore"),
    fs = require('fs.extra'),
    path = require('path');

var templateGenerator = function(stageName, options, cb){
  options = _.defaults(options, {location: '.'});
  var location = path.join(_.result(options, 'location'), "deploy"); // not great but it's probably ok

  fs.mkdirp(location, function  (err) {
    if(err) return cb(err);
    console.log("Created New Folder "+ location);
    fs.readFile(path.join(__dirname,"../templates/default.us"),  "utf-8", function (err, data) {
      var name = _.result(options, "name") || path.basename(path.resolve("."));

      if(err) return cb(err);
      console.log("Writing file " + path.join(location, (stageName || "deploy")+".js"));
      fs.writeFile(path.join(location, (stageName || "deploy")+".js"), _.template(data)({name: stageName, app_name: name, repository_url: "giturl"}), cb);
    });
  });
};

var outputFileGenerator = function (commands, timingData, options, cb) {
  fs.readFile(path.join(__dirname,"../templates/build_output/output.html.us"),  "utf-8", function (err, data) {
    console.log("Creating the Output file. Run open ./output.html to view the results");
    fs.writeFile("./output.html", _.template(data)({taskName: commands.join(", "), data: timingData}), cb);
  });
};

module.exports = {
  output: outputFileGenerator,
  template: templateGenerator
};