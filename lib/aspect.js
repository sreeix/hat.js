var _ = require('underscore');

var aspect = {
  select: function select (regex, advise, ctx) {
    _.defaults(advise, {after: this.noop, before: this.noop});
   _.chain(ctx).functions().select(function match (fun) {
     return fun.match(regex);
   }).each(function(method) {
     var previous = ctx[method];
     var wrapper = function preMethod(func, args, cb) {
       var functionToInvoke = _.first(arguments), 
           finalCallback =_.last(arguments), 
           argumentsToPass = _.toArray(arguments).slice(1,-1),
           compositeMethodCallback =  function (err, res) {
             var afterInvocation = function (methodError, methodResult) {
                   return advise.after.call(ctx, finalCallback);
                 };
              return previous.apply(ctx, argumentsToPass.concat(afterInvocation));
            };
       return advise.before.apply(ctx, [argumentsToPass, compositeMethodCallback]);
     };
     ctx[method] = _.wrap(previous, wrapper);
   }).value();
  },

// Yeah it's trying real hard to do noop
  noop: function(cb) {
    var args = _.toArray(arguments);
    var cb = _.last(args);
    var remainingArgs = args.slice(0, args.length -1)
    if(args.length === 0 || !_.isFunction(cb)) return ;
    return cb.apply(this, remainingArgs);
  }
};

module.exports = aspect;