var aspect = require("../../lib/aspect")
var foo = {
  testOneArg : function (argument, cb) {
    console.log('method called with '+ argument );
    
    return cb(null, argument);
  }
};

describe('aspect', function(){
  describe('select', function(){
    describe('single method class', function  () {
      it('finds functions and executes before function', function(done) {
          var beforeCalled = false;
          aspect.select(/.*/, {before: function(cb){beforeCalled = true; console.log('before');cb()}}, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(beforeCalled) return done();
            done("before not called");
          });
        });
      it('finds functions and executes after function', function(done) {
          var afterCalled = false;
          aspect.select(/.*/, {after: function(cb){afterCalled = true; console.log('afterCalled');cb()}}, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(afterCalled) return done();
            done("after not called");
          });
        });

      it('finds functions and executes before and after function', function(done) {
          var afterCalled = false, beforeCalled = false;
          aspect.select(/.*/, {before: function(cb){beforeCalled = true; console.log('beforeCalled');cb()},
                              after: function(cb){afterCalled = true; console.log('afterCalled');cb()}  }, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(afterCalled && beforeCalled) return done();
            done("after/before not called");
          });
        });

      it('matches by regex functions and executes before and after function', function(done) {
          var afterCalled = false, beforeCalled = false;
          aspect.select(/^test/, {before: function(cb){beforeCalled = true; console.log('beforeCalled');cb()},
                              after: function(cb){afterCalled = true; console.log('afterCalled');cb()}  }, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(afterCalled && beforeCalled) return done();
            done("after/before not called");
          });
        });

      it('not execute when  regex functions don;t match', function(done) {
          var afterCalled = false, beforeCalled = false;
          aspect.select(/^foobar/, {before: function(cb){beforeCalled = true; console.log('beforeCalled');cb()},
                              after: function(cb){afterCalled = true; console.log('afterCalled');cb()}  }, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(!afterCalled && !beforeCalled) return done();
            done("after/before were unexpectedly called");
          });
        });
    })
  });
});