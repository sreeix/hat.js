var _ = require('underscore');

var aspect = {
  select: function select (regex, advise, ctx) {
    _.defaults(advise, {after: this.noop, before: this.noop});
   _.chain(ctx).functions().select(function match (fun) {
     return fun.match(regex);
   }).each(function wrapMethodWithAdvise(method) {
     var previous = ctx[method];
     var wrapper = function preMethod(func, args, cb) {
       var functionToInvoke = _.first(arguments),
           finalCallback = _.last(arguments), // The last argument needs to be the callback.
           argumentsToPass = _.toArray(arguments).slice(1, -1), // Everything other than the last arg needs to passed over. The last one is the callback.
           compositeMethodCallback =  function (err, res) {
             var afterInvocation = function (methodError, methodResult) {
                   return advise.after.apply(ctx, [method, argumentsToPass, finalCallback]);
                 };
              return previous.apply(ctx, argumentsToPass.concat(afterInvocation));
            };
       return advise.before.apply(ctx, [method, argumentsToPass, compositeMethodCallback]);
     };
     ctx[method] = _.wrap(previous, wrapper);
   }).value();
  },

// Yeah it's trying real hard to do noop
  noop: function(cb) {
    var args = _.toArray(arguments),
        cb = _.last(args),
        remainingArgs = args.slice(0, -1)
    if(args.length === 0 || !_.isFunction(cb)) return ;
    return cb.apply(this, remainingArgs);
  }
};

module.exports = aspect;