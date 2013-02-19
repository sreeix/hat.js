var _ = require('underscore');

var aspect = {
  // Allows users to create an advice on a function.
  // Like so
  //  var foo = function(){ console.log('hey')}
  // var a = require('aspect')
  // var fooWithAfter = a.advice(foo, {after: function () {  console.log('after'); }})
  advice: function advice (fn, opts) {
    var self = this;
    opts = opts || {}
    opts = _.extend({after: this.noop, before: this.noop}, opts);
    opts.before.call(this, function() {
      fn.call(self, function(err, res) {
        opts.after.call(self)
      });
    });
  },
  select: function select (regex, advise, ctx) {
    _.defaults(advise, {after: this.noop, before: this.noop});
   _.chain(ctx).functions().select(function match (fun) {
     return fun.match(regex);
   }).each(function(method) {
     var previous = ctx[method];
     var wrapper = function preMethod(func, args, cb) {
       return advise.before.call(ctx, function (err, res) {
         previous.call(ctx, args, function (methodError, methodResult) {
           return advise.after.call(ctx, cb);
         });
       });
     };
     ctx[method] = _.wrap(previous, wrapper);
   }).value();
  },
  // noop: function(cb) {var args = _.toArray(arguments), cb = _.last(args); return cb(args.slice(0, args.length -1));}
  noop: function(cb) {return cb();}
};

module.exports = aspect;