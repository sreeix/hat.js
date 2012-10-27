var _ = require("underscore"),
    fs = require('fs.extra'),
    path = require('path');

var generator = function(stageName, options, cb){
  options = _.defaults(options, {location: '.'});
  var location = path.join(_.result(options, 'location'), "deploy"); // not great but it's probably ok

  fs.mkdirp(location, function  (err) {
    if(err) return cb(err);
    fs.readFile(path.join(__dirname,"../templates/default.us"),  "utf-8", function (err, data) {
      var name = _.result(options, "name") || path.basename(path.resolve("."));

      if(err) return cb(err);
      fs.writeFile(path.join(location, (stageName || "deploy")+".js"), _.template(data)({name: stageName, app_name: name, repository_url: "giturl"}), cb);
    });
  });
};

module.exports = generator;