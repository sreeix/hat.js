var aspect = require("../../lib/aspect");
var _ = require('underscore');
var foo = null;

describe('aspect', function(){
  describe('select', function(){
    describe('single method class', function  () {
      beforeEach(function () {
        foo = {
                testOneArg : function (argument, cb) {
                  console.log('method called with '+ argument );
                  return cb(null, argument);
                }
              };
      });
      
      it('finds functions and executes before function', function(done) {
          var beforeCalled = false;
          aspect.select(/.*/, {before: function(functionName, args, cb){beforeCalled = true; cb()}}, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(beforeCalled) return done();
            done("before not called");
          });
        });
      it('finds functions and executes after function', function(done) {
          var afterCalled = false;
          aspect.select(/.*/, {after: function(cb){afterCalled = true; ;cb()}}, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(afterCalled) return done();
            done("after not called");
          });
        });
    
      it('finds functions and executes before and after function', function(done) {
          var afterCalled = false, beforeCalled = false;
          aspect.select(/.*/, {before: function(functionName, args, cb){beforeCalled = true; ;cb()},
                              after: function(cb){afterCalled = true; ;cb()}  }, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(afterCalled && beforeCalled) return done();
            done("after/before not called");
          });
        });
    
      it('matches by regex functions and executes before and after function', function(done) {
          var afterCalled = false, beforeCalled = false;
          aspect.select(/^test/, {before: function(functionName, args, cb){beforeCalled = true; ;cb()},
                              after: function(cb){afterCalled = true; ;cb()}  }, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(afterCalled && beforeCalled) return done();
            done("after/before not called");
          });
        });
    
      it('not execute when  regex functions don;t match', function(done) {
          var afterCalled = false, beforeCalled = false;
          aspect.select(/^foobar/, {before: function(functionName, args, cb){beforeCalled = true; ;cb()},
                              after: function(cb){afterCalled = true; ;cb()}  }, foo);
          foo.testOneArg('foo', function  (err, res) {
            if(!afterCalled && !beforeCalled) return done();
            done("after/before were unexpectedly called");
          });
        });
        it('allows multiple filters', function(done) {
            var anotherBeforeCalled = false, beforeCalled = false;
            aspect.select(/^test/, {before: function(functionName, args, cb){beforeCalled = true; ;cb()}}, foo);
            aspect.select(/^test/, {before: function(functionName, args, cb){anotherBeforeCalled = true; ;cb()}}, foo);
            foo.testOneArg('foo', function  (err, res) {
              if(anotherBeforeCalled && beforeCalled) return done();
              done("multiple aspects were not not called");
            });
          });
    });
    
    describe('multi method class', function () {
      var nextSuccess = false; testSuccess = false;
      beforeEach(function() {
        foo = {
          test: function(cb) { testSuccess = true; cb()},
          next: function(x, y, cb) { nextSuccess = (x == 10 && y == 10); cb()}
        };
      });
      
      it('works for multiple methods', function (done) {
        var beforeCalledCount = 0;
        aspect.select(/.*/, {before: function(functionName, args, cb){beforeCalledCount++; cb()}}, foo);
        foo.test(function  (err, res) {
          if(beforeCalledCount === 0) return done('before not called');
          foo.next(10,10, function (err, res) {
            if(beforeCalledCount === 2 && nextSuccess && testSuccess) return done();
            done('before called only ' + beforeCalledCount);
          });
        });
      });
      it('works for multiple methods after', function (done) {
        var afterCalledCount = 0;
        aspect.select(/.*/, {after: function(cb){afterCalledCount++; cb()}}, foo);
        foo.test(function  (err, res) {
          if(afterCalledCount === 0) return done('before not called');
          foo.next(10,10, function (err, res) {
            if(afterCalledCount === 2 && nextSuccess && testSuccess) return done();
            done('before called only ' + beforeCalledCount);
          });
        });
      });

      it('works for multiple methods before and after', function (done) {
        var afterCalledCount = 0, beforeCalledCount = 0;
        aspect.select(/.*/, {before: function(functionName, args, cb){beforeCalledCount++; cb()}, after: function(cb){afterCalledCount++; cb()}}, foo);
        foo.test(function  (err, res) {
          if(afterCalledCount === 0) return done('before not called');
          foo.next(10,10, function (err, res) {
            if(afterCalledCount === 2 && nextSuccess && testSuccess) return done();
            done('before called only ' + beforeCalledCount);
          });
        });
      });
    });
    describe('timing', function() {
      beforeEach(function() {
        foo = {
          test: function(cb) { testSuccess = true; cb()},
        };
      });
    })
  });
});