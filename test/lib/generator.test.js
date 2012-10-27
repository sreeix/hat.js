var gen = require("../../lib/generator"),
    path = require("path")
    fs = require('fs.extra');

describe('generator', function(){
  describe('create', function(){
    var testFolder = "/tmp/foo";
    
    afterEach(function  (done) {
      fs.rmrf(testFolder, done);
    });
    it('creates a deploy script', function(done){
      gen("staging", {location: testFolder}, function (err) {
        fs.existsSync(path.join(testFolder, "deploy/staging.js")).should.equal(true);
        done();
      });
    });
    it('can be required', function(done){
      gen("staging", {location: testFolder}, function (err) {
        var staging = null, generatedFile = path.join(testFolder, "deploy/staging.js");
        fs.existsSync(generatedFile).should.equal(true);
        staging = require(generatedFile);
        staging.name.should.equal("hat.js");
        done();
      });
    });
  })
});
