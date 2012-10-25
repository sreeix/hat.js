var core = require("../../lib/core")

describe('core', function(){
  describe('ssh', function(){
    it('connects via ssh', function(done){
      core._ssh.call({app: {options:{}}}, 'localhost', 'ls', function(err, logs){
        done();
      });
    });
  })
});
