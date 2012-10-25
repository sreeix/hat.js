var util = require("../../lib/util")

describe('util', function(){
  describe('advice', function(){
    it('executes the function', function(done) {
      util.advice(function(cb) {done()})
    });

    it('executes the before advice before function', function(done) {
      var beforeCalled = false;
      util.advice(function(cb) {
        beforeCalled.should.equal(true)
        done()
      }, {before: function(cb) {beforeCalled = true; cb()}});
    })

    it('executes the after advice after function', function(done) {
      var afterCalled = false;
      util.advice(function(cb) {
        afterCalled.should.equal(false);
        cb();
      }, {after: done});
    });

    it('executes shares context in the advice', function(done) {
      util.advice.call({a:10, b:30}, function(cb) {
        this.a.should.equal(10);
        this.a = 100;
        cb();
      }, {after: function() { this.a.should.equal(100); done();}});
    });
  });
});