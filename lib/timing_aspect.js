var _ = require('underscore'), 
    util = require('util');

module.exports = timingAspect = {
  timings : [],
  aspect: function () {
    return {
      before: function(name, args, cb) {
        var item = {name: name, children: [], startTime: new Date().valueOf()};
        if(_.isUndefined(timingAspect.root)) timingAspect.root = item;
        timingAspect.timings.push(item);
        return cb();
      },
      after: function(cb) {
        var item = timingAspect.timings.pop(),
            endTime = new Date().valueOf(),
            parent = _.last(timingAspect.timings);
        if(!_.isUndefined(parent)){
          parent.children.push(item);
        }
        item.endTime = endTime; item.totalTime = endTime - item.startTime;
        return cb();
      }
    };
  },
  results: function () {
    return JSON.stringify(timingAspect.root);
  }
};