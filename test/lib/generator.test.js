var gen = require("../../lib/generator"),
    path = require("path")
    fs = require('fs.extra'),
    logger = require('../../lib/logger')('silly');

describe('generator', function(){
  describe('create template', function(){
    var testFolder = "/tmp/foo";

    afterEach(function  (done) {
      fs.rmrf(testFolder, done);
    });
    it('creates a deploy script', function(done){
      gen.template("staging", {location: testFolder, logger: logger}, function (err) {
        fs.existsSync(path.join(testFolder, "deploy/staging.js")).should.equal(true);
        done();
      });
    });
    it('can be required', function(done){
      gen.template("staging", {location: testFolder, logger: logger}, function (err) {
        var staging = null, generatedFile = path.join(testFolder, "deploy/staging.js");
        fs.existsSync(generatedFile).should.equal(true);
        staging = require(generatedFile);
        staging.name.should.equal("hat.js");
        done();
      });
    });
  })
});
